from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, uuid, time, re
from typing import Dict
from models_config import build_request
from dotenv import load_dotenv
from google import genai
load_dotenv()

app = FastAPI(title="EchoIntellect Backend", version="0.2.1")

# ==========================
# ✅ CORS Configuration
# ==========================
origins = ["*", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# 📦 Data Models
# ==========================
class AskBody(BaseModel):
    model: str
    prompt: str

class ShareBody(BaseModel):
    model: str
    prompt: str
    response: str

# ==========================
# 🧠 In-memory share storage
# ==========================
SHARES: Dict[str, Dict] = {}

# ==========================
# 🧹 Utility Functions
# ==========================
def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_`]+", "", text)
    text = re.sub(r"https?:\/\/(www\.)?paypal\.com\/donate\/?.*", "", text)
    text = re.sub(r"support\s*this\s*free\s*api.*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"['\"]?(status|servercode)['\"]?:\s*['\"]?.*?['\"]?(,|\})?", "", text, flags=re.IGNORECASE)
    return text.strip()

def enforce_model_identity(text: str) -> str:
    """
    Remove any model/version mentions (like GPT-4, ChatGPT 3.5, etc.)
    without replacing them with placeholder text.
    """
    if not text:
        return text
    patterns = [
        r"\bchatgpt[- ]?\d+(\.\d+)?\b",
        r"\bgpt[- ]?\d+(\.\d+)?\b",
        r"\bopenai\s*model\b",
        r"\bmodel\s*version\b",
        r"\bversion\s*[:\-]?\s*\w+",
        r"\bapi\s*model\b"
    ]
    for p in patterns:
        text = re.sub(p, "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r" ,", ",", text)
    text = re.sub(r"\s+\.", ".", text)
    return text.strip()

def format_response(answer: str) -> str:
    """✨ Enhance readability for all models (especially GPT)."""
    if not answer:
        return ""

    # --- Normalize escaped characters ---
    answer = (
        answer
        .replace("\\\\n", "\n")   # Convert double-escaped newline first
        .replace("\\n", "\n")     # Then convert single-escaped newline
        .replace("\\t", "    ")   # Tabs to spaces
    )

    # --- Normalize Markdown-style formatting ---
    answer = re.sub(r"```(\w+)?", "\n", answer)  # Remove ``` markers cleanly
    answer = re.sub(r"\*{1,2}", "", answer)      # Remove * or ** around text
    answer = re.sub(r"_+", "", answer)           # Remove underscores
    answer = re.sub(r"`+", "", answer)           # Remove inline code ticks

    # --- Fix line density ---
    # Add paragraph breaks after sentences that are smashed together
    answer = re.sub(r"([a-z0-9\)])([A-Z])", r"\1\n\n\2", answer)

    # --- Remove excessive or missing newlines ---
    answer = re.sub(r"\n{3,}", "\n\n", answer)  # Too many → just two
    answer = re.sub(r"[ \t]+\n", "\n", answer)  # Trim spaces before newline

    # --- Clean bullet points ---
    answer = re.sub(r"•", "-", answer)
    answer = re.sub(r"(?<!\n)\s*-\s+", "\n- ", answer)  # Force bullet points on new line

    # --- Final polish ---
    answer = re.sub(r"\s{2,}", " ", answer)  # Remove double spaces
    answer = re.sub(r" +\n", "\n", answer)   # Trim right-side spaces
    answer = re.sub(r"\n{2,}\s*-\s", "\n- ", answer)  # Fix bullet alignment

    return answer.strip()

# ==========================
# 🚀 Main Ask Endpoint
# ==========================
@app.post("/api/ask")
def ask(body: AskBody):
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if not rapidapi_key:
        return {"text": clean_text(f"[MOCK:{body.model}] You asked: {body.prompt}")}

    # --- Gemini (via official SDK) ---
    if body.model.lower() == "gemini":
        api_key = os.getenv("GEMINI_KEY")
        if not api_key:
            return {"text": "[ERROR] GEMINI_KEY missing in .env"}

        try:
            client = genai.Client(api_key=api_key)
            
            # ✅ Better instruction
            instruction = (
                "You are Gemini 2.5 Flash.\n\n"
                "🔴 CRITICAL: Respond in THE SAME LANGUAGE as the user's input.\n"
                "- English input → English output\n"
                "- Hinglish input → Hinglish output\n"
                "- NEVER use Devanagari script\n\n"
                f"{body.prompt}"
            )
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=instruction
            )
            answer = getattr(response, "text", "[No response]").strip()
            return {"text": format_response(clean_text(answer))}
        except Exception as e:
            return {"text": f"[EXCEPTION - GEMINI] {str(e)}"}

    # --- Other Models (RapidAPI) ---
    url, headers, payload, querystring = build_request(body.model, body.prompt, rapidapi_key)

    try:
        if not url:
            return {"text": "[ERROR] Invalid or missing URL"}

        if querystring:
            r = requests.post(url, json=payload, headers=headers, params=querystring, timeout=300)
        else:
            r = requests.post(url, json=payload, headers=headers, timeout=300)

        r.raise_for_status()
        data = r.json()

        # --- Perplexity ---
        if body.model.lower() == "perplexity":
            try:
                answer = ""
                if isinstance(data, dict):
                    if "output_text" in data:
                        answer = data["output_text"]
                    elif "choices" in data and isinstance(data["choices"], list) and len(data["choices"]) > 0:
                        choice = data["choices"][0]
                        if "message" in choice and "content" in choice["message"]:
                            answer = choice["message"]["content"]
                        elif "content" in choice:
                            answer = choice["content"]
                    elif "response" in data and isinstance(data["response"], dict):
                        answer = data["response"].get("text") or data["response"].get("content", "")
                    elif "text" in data:
                        answer = data["text"]

                if not answer:
                    matches = re.findall(r"'text':\s*'([^']+)'", str(data))
                    if matches:
                        answer = "\n".join(matches)

                if not answer:
                    answer = str(data)

                # ✅ Clean & format
                answer = format_response(enforce_model_identity(clean_text(answer)))

                if len(answer.strip()) < 150:
                    answer += "\n\n[Note: The response seems short — try regenerating for more detail.]"

                return {"text": answer}

            except Exception as e:
                return {"text": f"[ERROR: Cannot extract clean Perplexity response — {type(e).__name__}: {str(e)}]"}

        # --- DeepSeek ---
        if body.model.lower() == "deepseek":
            try:
                choices = data.get("choices")
                if not choices:
                    return {"text": "[ERROR: No choices returned by DeepSeek]"}

                message = choices[0].get("message")
                if not message:
                    return {"text": "[ERROR: No message in DeepSeek response]"}

                answer = message.get("content") or message.get("reasoning_content") or ""
                answer = re.sub(r"<\/?(think|hink)>.*?<\/(think|hink)>", "", answer, flags=re.DOTALL)
                parts = [p.strip() for p in answer.splitlines() if p.strip()]
                answer = "\n".join(parts)

                return {"text": format_response(clean_text(answer))}
            except Exception as e:
                return {"text": f"[ERROR: Cannot extract DeepSeek response: {e}]"}

        # --- GPT / Default ---
        if body.model.lower() == "gpt":
            try:
                answer = None
                if isinstance(data, dict):
                    if "choices" in data and data["choices"]:
                        msg = data["choices"][0].get("message") or {}
                        answer = msg.get("content") or data["choices"][0].get("text")
                    elif "result" in data:
                        answer = data["result"]
                if not answer:
                    answer = str(data)
                return {"text": format_response(enforce_model_identity(clean_text(answer)))}
            except Exception as e:
                return {"text": f"[ERROR extracting GPT response: {e}]"}

        # --- Fallback ---
        return {"text": format_response(clean_text(str(data)))}

    except Exception as e:
        return {"text": f"[EXCEPTION] {str(e)}"}


# ==========================
# 🔗 Share API
# ==========================
@app.post("/api/share")
def create_share(body: ShareBody):
    sid = uuid.uuid4().hex[:12]
    SHARES[sid] = {
        "id": sid,
        "model": body.model,
        "prompt": body.prompt,
        "response": body.response,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    frontend = os.getenv("FRONTEND_PUBLIC_URL", "http://localhost:5173")
    return {"id": sid, "url": f"{frontend}/share/{sid}"}

@app.get("/api/share/{sid}")
def get_share(sid: str):
    rec = SHARES.get(sid)
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    return rec
