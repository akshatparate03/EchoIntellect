from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, uuid, time
from typing import Dict
from models_config import build_request
import ast
from dotenv import load_dotenv

# Load environment variables
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
    rapidapi_key = os.getenv("RAPIDAPI_KEY", "")
    if not rapidapi_key:
        return {"text": f"[MOCK:{body.model}] You asked: {body.prompt}"}

    url, headers, payload = build_request(body.model, body.prompt, rapidapi_key)

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=60)
        r.raise_for_status()
        data = r.json()

        # GPT ka result string me aata hai
        result_str = data.get("result", "")

        # Try to extract JSON part containing 'choices'
        answer = None
        try:
            # Split string on '{"id"' (jo JSON start hota hai) and parse
            json_part = result_str.split("{'id'")[-1]
            json_part = "{'id'" + json_part  # prefix add back
            json_dict = ast.literal_eval(json_part)
            answer = json_dict["choices"][0]["message"]["content"]
        except Exception:
            # Fallback: last part of string after last '}' could be raw text
            answer = result_str.split("}")[-1].strip()

        return {"text": answer}

    except Exception as e:
        return {"text": f"[EXCEPTION] {str(e)}"}

@app.get("/api/share/{sid}")
def get_share(sid: str):
    """Retrieve a shared conversation"""
    rec = SHARES.get(sid)
    if not rec:
        raise HTTPException(status_code=404, detail="Not found")
    return rec
