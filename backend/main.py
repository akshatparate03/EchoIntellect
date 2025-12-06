from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, uuid, time, re
from typing import Dict
from models_config import build_request
from dotenv import load_dotenv
import google.genai as genai
from error_handler import get_error_message, handle_api_exception, handle_model_specific_error

load_dotenv()

app = FastAPI(title="EchoIntellect Backend", version="0.2.1")

# ==========================
# âœ… CORS Configuration
# ==========================
origins = ["*", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# ðŸ“¦ Data Models
# ==========================
class AskBody(BaseModel):
    model: str
    prompt: str

class ShareBody(BaseModel):
    model: str
    prompt: str
    response: str

# ==========================
# ðŸ§  In-memory share storage
# ==========================
SHARES: Dict[str, Dict] = {}

# ==========================
# ðŸ§¹ Utility Functions
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
    """Enhance readability for all models (especially GPT)."""
    if not answer:
        return ""

    answer = (
        answer
        .replace("\\\\n", "\n")
        .replace("\\n", "\n")
        .replace("\\t", "    ")
    )

    answer = re.sub(r"```(\w+)?", "\n", answer)
    answer = re.sub(r"\*{1,2}", "", answer)
    answer = re.sub(r"_+", "", answer)          
    answer = re.sub(r"`+", "", answer)           

    answer = re.sub(r"([a-z0-9\)])([A-Z])", r"\1\n\n\2", answer)

    answer = re.sub(r"\n{3,}", "\n\n", answer)
    answer = re.sub(r"[ \t]+\n", "\n", answer)

    answer = re.sub(r"â€¢", "-", answer)
    answer = re.sub(r"(?<!\n)\s*-\s+", "\n- ", answer)

    answer = re.sub(r"\s{2,}", " ", answer)
    answer = re.sub(r" +\n", "\n", answer)
    answer = re.sub(r"\n{2,}\s*-\s", "\n- ", answer)

    return answer.strip()

# ==========================
# ðŸš€ Main Ask Endpoint
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
            return handle_model_specific_error("Gemini", "api_key_missing")

        try:
            client = genai.Client(api_key=api_key)
            
            instruction = (
                "You are Gemini 2.5 Flash.\n\n"
                "CRITICAL: Respond in THE SAME LANGUAGE as the user's input.\n"
                "- English input â†’ English output\n"
                "- Hinglish input â†’ Hinglish output\n"
                "- NEVER use Devanagari script\n\n"
                f"{body.prompt}"
            )
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=instruction
            )
            answer = getattr(response, "text", "").strip()
            
            if not answer:
                return handle_model_specific_error("Gemini", "no_response")
            
            return {"text": format_response(clean_text(answer))}
            
        except requests.exceptions.Timeout:
            return get_error_message(504, "Gemini")
        except requests.exceptions.ConnectionError:
            return get_error_message(503, "Gemini")
        except Exception as e:
            error_str = str(e).lower()
            
            # Check for quota/rate limit errors
            if "quota" in error_str or "rate limit" in error_str or "429" in error_str:
                return get_error_message(429, "Gemini")
            
            # Check for authentication errors
            if "authentication" in error_str or "unauthorized" in error_str or "401" in error_str:
                return get_error_message(401, "Gemini")
            
            # Check for forbidden errors
            if "forbidden" in error_str or "403" in error_str:
                return get_error_message(403, "Gemini")
            
            return handle_api_exception(e, "Gemini")

    # Build request for other models
    try:
        url, headers, payload, querystring = build_request(body.model, body.prompt, rapidapi_key)
    except ValueError as e:
        return handle_model_specific_error(body.model, "api_key_missing", str(e))
    except Exception as e:
        return handle_api_exception(e, body.model)

    try:
        if not url:
            return handle_model_specific_error(body.model, "invalid_response", "Invalid or missing URL")

        # Make API request
        if querystring:
            r = requests.post(url, json=payload, headers=headers, params=querystring, timeout=500)
        else:
            r = requests.post(url, json=payload, headers=headers, timeout=500)

        # Check for HTTP errors and return appropriate messages
        if r.status_code != 200:
            return get_error_message(r.status_code, body.model.upper())

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
                    return handle_model_specific_error("Perplexity", "no_response")

                answer = format_response(enforce_model_identity(clean_text(answer)))
                return {"text": answer}

            except KeyError as e:
                return handle_model_specific_error("Perplexity", "invalid_response", f"Missing key: {str(e)}")
            except Exception as e:
                return handle_api_exception(e, "Perplexity")

        # --- DeepSeek ---
        if body.model.lower() == "deepseek":
            try:
                choices = data.get("choices")
                if not choices:
                    return handle_model_specific_error("DeepSeek", "invalid_response", "No choices returned")

                message = choices[0].get("message")
                if not message:
                    return handle_model_specific_error("DeepSeek", "invalid_response", "No message in response")

                answer = message.get("content") or message.get("reasoning_content") or ""
                
                if not answer:
                    return handle_model_specific_error("DeepSeek", "no_response")
                
                answer = re.sub(r"<\/?(think|hink)>.*?<\/(think|hink)>", "", answer, flags=re.DOTALL)
                parts = [p.strip() for p in answer.splitlines() if p.strip()]
                answer = "\n".join(parts)

                return {"text": format_response(clean_text(answer))}
                
            except KeyError as e:
                return handle_model_specific_error("DeepSeek", "invalid_response", f"Missing key: {str(e)}")
            except Exception as e:
                return handle_api_exception(e, "DeepSeek")

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
                    return handle_model_specific_error("GPT", "no_response")
                
                return {"text": format_response(enforce_model_identity(clean_text(answer)))}
                
            except KeyError as e:
                return handle_model_specific_error("GPT", "invalid_response", f"Missing key: {str(e)}")
            except Exception as e:
                return handle_api_exception(e, "GPT")

        # --- Fallback ---
        return {"text": format_response(clean_text(str(data)))}

    except requests.exceptions.Timeout:
        return get_error_message(504, body.model.upper())
    
    except requests.exceptions.ConnectionError:
        return get_error_message(503, body.model.upper())
    
    except requests.exceptions.HTTPError as e:
        if e.response is not None:
            return get_error_message(e.response.status_code, body.model.upper())
        return get_error_message(500, body.model.upper())
    
    except requests.exceptions.RequestException as e:
        return handle_api_exception(e, body.model.upper())
    
    except ValueError as e:
        # JSON decode errors
        error_str = str(e).lower()
        if "json" in error_str:
            return handle_model_specific_error(body.model.upper(), "invalid_response", "JSON parse error")
        return handle_api_exception(e, body.model.upper())
    
    except Exception as e:
        return handle_api_exception(e, body.model.upper())


# ==========================
# ðŸ”— Share API
# ==========================
@app.post("/api/share")
def create_share(body: ShareBody):
    try:
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
    except Exception as e:
        return {"error": f"âŒ Share create karte waqt error aaya: {str(e)}"}

@app.get("/api/share/{sid}")
def get_share(sid: str):
    try:
        rec = SHARES.get(sid)
        if not rec:
            raise HTTPException(status_code=404, detail="Share nahi mila")
        return rec
    except HTTPException:
        raise
    except Exception as e:
        return {"error": f"âŒ Share retrieve karte waqt error aaya: {str(e)}"}