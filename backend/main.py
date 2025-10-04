from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, uuid, time
from typing import Dict
from models_config import build_request
import ast
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

@app.post("/api/ask")
def ask(body: AskBody):
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if not rapidapi_key:
        return {"text": f"[MOCK:{body.model}] You asked: {body.prompt}"}

    url, headers, payload, querystring = build_request(body.model, body.prompt, rapidapi_key)

    try:
        # API Call
        if querystring:
            r = requests.post(url, json=payload, headers=headers, params=querystring, timeout=60)
        else:
            r = requests.post(url, json=payload, headers=headers, timeout=60)

        r.raise_for_status()
        data = r.json()

        # ----------------- GEMINI -----------------
        if body.model.lower() == "gemini":
            try:
                return {"text": data["candidates"][0]["content"]["parts"][0]["text"]}
            except Exception:
                return {"text": str(data)}

        # ----------------- PERPLEXITY -----------------
        if body.model.lower() == "perplexity":
            try:
                return {"text": data["choices"]["content"]["parts"][0]["text"]}
            except Exception:
                return {"text": str(data)}

        # ----------------- DEEPSEEK -----------------
        if body.model.lower() == "deepseek":
            try:
                import re
                answer = data["model_response"]["choices"][0]["message"]["content"]

                # Remove <think>/<hink> blocks with content
                answer = re.sub(r"<\/?(think|hink)>.*?<\/(think|hink)>", "", answer, flags=re.DOTALL)

                # Remove reasoning-style meta lines
                answer = re.sub(
                    r"(Okay,.*?$|So,.*?$|I need to.*?$|Looking at.*?$)",
                    "",
                    answer,
                    flags=re.IGNORECASE | re.MULTILINE
                )

                # Keep only last meaningful conversational line
                parts = [p.strip() for p in answer.splitlines() if p.strip()]
                if parts:
                    answer = parts[-1]

                return {"text": answer.strip()}
            except Exception:
                return {"text": "[ERROR: Cannot extract DeepSeek response]"}

        # ----------------- GPT / OTHERS -----------------
        if body.model.lower() == "gpt":
            try:
                if "choices" in data and len(data["choices"]) > 0:
                    return {"text": data["choices"][0]["message"]["content"].strip()}
                else:
                    # Fallback to result parsing
                    result_str = data.get("result", "")
                    if result_str:
                        import ast
                        try:
                            json_part = result_str.split("{'id'")[-1]
                            json_part = "{'id'" + json_part
                            json_dict = ast.literal_eval(json_part)
                            return {"text": json_dict["choices"][0]["message"]["content"].strip()}
                        except Exception:
                            return {"text": result_str.strip()}
                    else:
                        return {"text": str(data)}
            except Exception:
                return {"text": "[ERROR: Cannot extract GPT response]"}

        # ----------------- DEFAULT FALLBACK -----------------
        return {"text": str(data)}

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
