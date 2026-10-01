import os

from dotenv import load_dotenv

load_dotenv()

OPENROUTER_URL = os.getenv("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions")

# OpenRouter model ids (override any of them from the environment if OpenRouter renames a model)
DEFAULT_MODEL_IDS = {
    "gpt": "openai/gpt-5-mini",
    "gemini": "google/gemini-2.5-flash",
    "perplexity": "perplexity/sonar-reasoning-pro",
    "deepseek": "deepseek/deepseek-chat-v3-0324",
}

# One OpenRouter key per model
KEY_ENV_NAMES = {
    "gpt": "OPENROUTER_KEY_GPT",
    "gemini": "OPENROUTER_KEY_GEMINI",
    "perplexity": "OPENROUTER_KEY_PERPLEXITY",
    "deepseek": "OPENROUTER_KEY_DEEPSEEK",
}

_COMMON_RULES = (
    "RESPONSE LENGTH RULE:\n"
    "- If user just says greetings like 'hi', 'hello', 'hey', 'namaste' etc. WITHOUT any question → respond in just 1-2 lines casually\n"
    "- If user asks ANY question or needs help → give detailed, clear, and structured explanations with proper examples\n\n"
    "IMPORTANT: Detect the user's language and respond in THE SAME LANGUAGE.\n"
    "- If user writes in English, respond in English\n"
    "- If user writes in Hinglish (Hindi written in English), respond in Hinglish\n"
    "- NEVER respond in Devanagari (Hindi) script\n\n"
)

SYSTEM_PROMPTS = {
    "gpt": (
        "You are an advanced AI model named ChatGPT 5.\n\n"
        + _COMMON_RULES
        + "Always give clear, deep, and structured explanations with proper examples.\n"
        "Provide proper spacing and line breaks in responses specially in codes.\n\n"
        "Respond as if explaining to a beginner clearly and completely.\n\n"
    ),
    "gemini": (
        "You are Gemini 2.5 Flash.\n\n"
        "CRITICAL: Respond in THE SAME LANGUAGE as the user's input.\n"
        "- English input → English output\n"
        "- Hinglish input → Hinglish output\n"
        "- NEVER use Devanagari script\n\n"
    ),
    "perplexity": (
        "You are an advanced AI model named Perplexity Sonar Reasoning Pro.\n\n"
        + _COMMON_RULES
        + "Always give long, detailed, and deeply explained answers with examples where possible.\n"
        "Provide proper spacing and line breaks in responses specially in codes.\n"
        "Explain concepts like a teacher explaining to a beginner.\n\n"
    ),
    "deepseek": (
        "You are an advanced AI model named DeepSeek V3.\n\n"
        + _COMMON_RULES
        + "Always give long, detailed, and deeply explained answers with examples where possible.\n"
        "Provide proper spacing and line breaks in responses specially in codes.\n"
        "Explain concepts like a teacher explaining to a beginner.\n\n"
    ),
}

# extra request fields per model
EXTRA_PAYLOAD = {
    "perplexity": {"max_tokens": 2048, "temperature": 0.8},
    "deepseek": {"max_tokens": 2048, "temperature": 0.8},
}


def get_api_key(model: str) -> str:
    return (os.getenv(KEY_ENV_NAMES[model]) or "").strip()


def build_request(model: str, prompt: str, history=None):
    """
    Build the OpenRouter chat-completions request for one model.
    history: optional [(user_prompt, model_reply), ...] - earlier turns of the same chat.
    Returns (url, headers, payload).
    """
    model = model.lower()
    if model not in DEFAULT_MODEL_IDS:
        raise ValueError(f"Unsupported model: {model}")

    key = get_api_key(model)
    if not key:
        raise ValueError(f"{KEY_ENV_NAMES[model]} environment variable missing")

    model_id = os.getenv(f"OPENROUTER_MODEL_{model.upper()}") or DEFAULT_MODEL_IDS[model]

    messages = [{"role": "system", "content": SYSTEM_PROMPTS[model]}]
    for p, r in history or []:
        messages.append({"role": "user", "content": p})
        messages.append({"role": "assistant", "content": r})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": os.getenv("FRONTEND_PUBLIC_URL", "https://echointellect.netlify.app"),
        "X-Title": "EchoIntellect",
    }
    payload = {"model": model_id, "messages": messages, **EXTRA_PAYLOAD.get(model, {})}
    return OPENROUTER_URL, headers, payload