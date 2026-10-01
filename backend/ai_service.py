import os
import re

import requests
from dotenv import load_dotenv

from error_handler import get_error_message, handle_api_exception, handle_model_specific_error
from models_config import build_request

load_dotenv()

# history = [(user_prompt, model_reply), ...] oldest -> newest


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
        r"\bapi\s*model\b",
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

    answer = re.sub(r"•", "-", answer)
    answer = re.sub(r"(?<!\n)\s*-\s+", "\n- ", answer)

    answer = re.sub(r"\s{2,}", " ", answer)
    answer = re.sub(r" +\n", "\n", answer)
    answer = re.sub(r"\n{2,}\s*-\s", "\n- ", answer)

    return answer.strip()


def is_error_text(text: str) -> bool:
    """error_handler.py returns error messages as normal {"text": ...} dicts."""
    t = (text or "").lstrip()
    return t.startswith("Error:-") or t.startswith("⚠️")


# ==========================
# 🚀 Run one model (all models go through OpenRouter)
# ==========================
def strip_think(text: str) -> str:
    """Remove <think>...</think> reasoning blocks some models put inside the answer."""
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
    return re.sub(r"</?think>", "", text, flags=re.IGNORECASE)


def _extract_answer(data) -> str:
    """OpenRouter always answers in the OpenAI chat-completions shape."""
    if not isinstance(data, dict):
        return ""
    choices = data.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    content = message.get("content")
    if isinstance(content, list):  # some providers return content parts
        content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return (content or "").strip()


def _postprocess(model: str, answer: str) -> str:
    answer = strip_think(answer)
    if model == "gemini":
        return format_response(clean_text(answer))
    if model == "deepseek":
        answer = "\n".join(p.strip() for p in answer.splitlines() if p.strip())
        return format_response(clean_text(answer))
    # gpt, perplexity
    return format_response(enforce_model_identity(clean_text(answer)))


def run_model(model: str, prompt: str, history: list[tuple[str, str]] | None = None) -> dict:
    """Returns {"text": "..."} - either the answer or a user-friendly error message."""
    model = model.lower()
    name = model.upper()

    # Offline testing without spending credits: set MOCK_AI=true
    if os.getenv("MOCK_AI", "").lower() in ("1", "true", "yes"):
        return {"text": clean_text(f"[MOCK:{model}] You asked: {prompt}")}

    try:
        url, headers, payload = build_request(model, prompt, history)
    except ValueError as e:
        return handle_model_specific_error(name, "api_key_missing", str(e))
    except Exception as e:
        return handle_api_exception(e, name)

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=180)

        if r.status_code != 200:
            return get_error_message(r.status_code, name)

        data = r.json()

        # OpenRouter can return HTTP 200 with an error object inside
        if isinstance(data, dict) and data.get("error") and not data.get("choices"):
            err = data["error"]
            code = err.get("code") if isinstance(err, dict) else None
            if isinstance(code, int):
                return get_error_message(code, name)
            return handle_model_specific_error(name, "invalid_response", str(err)[:200])

        answer = _extract_answer(data)
        if not answer:
            return handle_model_specific_error(name, "no_response")

        text = _postprocess(model, answer)
        if not text:
            return handle_model_specific_error(name, "no_response")
        return {"text": text}

    except requests.exceptions.Timeout:
        return get_error_message(504, name)
    except requests.exceptions.ConnectionError:
        return get_error_message(503, name)
    except requests.exceptions.RequestException as e:
        return handle_api_exception(e, name)
    except ValueError as e:  # JSON decode errors
        if "json" in str(e).lower():
            return handle_model_specific_error(name, "invalid_response", "JSON parse error")
        return handle_api_exception(e, name)
    except Exception as e:
        return handle_api_exception(e, name)