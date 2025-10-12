from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, uuid, time
from typing import Dict
from models_config import build_request
import ast
import re
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="EchoIntellect Backend", version="0.1.0")

# CORS configuration
origins = ["*", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskBody(BaseModel):
    model: str
    prompt: str

class ShareBody(BaseModel):
    model: str
    prompt: str
    response: str

# In-memory shares store
SHARES: Dict[str, Dict] = {}

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Remove markdown headings (##, ###, ####, etc.)
    text = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)
    # Remove asterisks (* or ** used in markdown bold/italic)
    text = re.sub(r"\*+", "", text)
    # Remove underscores (_ or __ used for italics)
    text = re.sub(r"_+", "", text)
    # Remove backticks (`) used in code formatting
    text = re.sub(r"`+", "", text)
    # Strip leading/trailing spaces
    return text.strip()

@app.post("/api/ask")
def ask(body: AskBody):
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if not rapidapi_key:
        return {"text": clean_text(f"[MOCK:{body.model}] You asked: {body.prompt}")}

    url, headers, payload, querystring = build_request(body.model, body.prompt, rapidapi_key)

    try:
        # API Call
        if querystring:
            r = requests.post(url, json=payload, headers=headers, params=querystring, timeout=120)
        else:
            r = requests.post(url, json=payload, headers=headers, timeout=120)

        r.raise_for_status()
        data = r.json()

        # ----------------- GEMINI -----------------
        if body.model.lower() == "gemini":
            try:
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"text": clean_text(answer)}
            except Exception:
                return {"text": clean_text(str(data))}

        # ----------------- PERPLEXITY -----------------
        if body.model.lower() == "perplexity":
            try:
                answer = data["choices"]["content"]["parts"][0]["text"]
                return {"text": clean_text(answer)}
            except Exception:
                return {"text": clean_text(str(data))}

        # ----------------- DEEPSEEK -----------------
        if body.model.lower() == "deepseek":
            try:
                choices = data.get("choices")
                if not choices or len(choices) == 0:
                    return {"text": "[ERROR: No choices returned by DeepSeek]"}
                
                message = choices[0].get("message")
                if not message:
                    return {"text": "[ERROR: No message in DeepSeek response]"}
                
                # Prefer content, fallback to reasoning_content
                answer = message.get("content") or message.get("reasoning_content")
                if not answer:
                    return {"text": "[ERROR: DeepSeek returned empty content]"}
                
                # Remove <think> or <hink> tags and their content
                answer = re.sub(r"<\/?(think|hink)>.*?<\/(think|hink)>", "", answer, flags=re.DOTALL)
                
                # Split into lines, strip spaces, remove empty lines
                parts = [p.strip() for p in answer.splitlines() if p.strip()]
                
                # Join all lines to keep full response
                answer = "\n".join(parts)
                
                # Final cleanup (markdown, asterisks, underscores, backticks)
                answer = clean_text(answer)
                
                return {"text": answer}

            except Exception as e:
                return {"text": f"[ERROR: Cannot extract DeepSeek response: {e}]"}


        # ----------------- GPT / OTHERS -----------------
        if body.model.lower() == "gpt":
            try:
                if "choices" in data and len(data["choices"]) > 0:
                    answer = data["choices"][0]["message"]["content"]
                    return {"text": clean_text(answer)}
                else:
                    # Fallback to result parsing
                    result_str = data.get("result", "")
                    if result_str:
                        try:
                            json_part = result_str.split("{'id'")[-1]
                            json_part = "{'id'" + json_part
                            json_dict = ast.literal_eval(json_part)
                            answer = json_dict["choices"][0]["message"]["content"]
                            return {"text": clean_text(answer)}
                        except Exception:
                            return {"text": clean_text(result_str)}
                    else:
                        return {"text": clean_text(str(data))}
            except Exception:
                return {"text": "[ERROR: Cannot extract GPT response]"}

        # ----------------- DEFAULT FALLBACK -----------------
        return {"text": clean_text(str(data))}

    except Exception as e:
        return {"text": f"[EXCEPTION] {str(e)}"}

    
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
    """Retrieve a shared conversation"""
    rec = SHARES.get(sid)
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    return rec