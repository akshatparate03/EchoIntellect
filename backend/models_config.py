import os
from dotenv import load_dotenv
load_dotenv()

def build_request(model: str, prompt: str, rapidapi_key: str):
    """
    Build RapidAPI request configuration for different AI models.
    Uses environment variables for URLs and hosts.
    """
    model = model.lower()
    headers = {
        "x-rapidapi-key": rapidapi_key,
        "Content-Type": "application/json",
    }

    if model == "gpt":
        url = os.getenv("GPT_URL")
        headers["x-rapidapi-host"] = os.getenv("GPT_HOST")
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": "Always reply in the same language and style as the user prompt. "
                               "If user writes in Hinglish, respond in Hinglish. "
                               "If in English, respond in English."
                },
                {"role": "user", "content": prompt}
            ],
            "web_access": False
        }
        return url, headers, payload, None  # no query params

    if model == "gemini":
        url = os.getenv("GEMINI_URL")
        headers["x-rapidapi-host"] = os.getenv("GEMINI_HOST")
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": "Always reply in the same language as the input. "
                                    "Match Hinglish with Hinglish, English with English.\n\n"
                                    + prompt}]
                }
            ]
        }
        querystring = {"key": os.getenv("GEMINI_API_KEY")}
        return url, headers, payload, querystring

    if model == "perplexity":
        url = os.getenv("PERPLEXITY_URL")
        headers["x-rapidapi-host"] = os.getenv("PERPLEXITY_HOST")
        payload = {
            "content": "Always reply in the same language as input.\n\n"
                    "Match Hinglish with Hinglish, English with English.\n\n"
                        + prompt
        }
        return url, headers, payload, None


    if model == "deepseek":
        url = os.getenv("DEEPSEEK_URL")
        headers["x-rapidapi-host"] = os.getenv("DEEPSEEK_HOST")
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a chat assistant. "
                        "Always reply ONLY with the final message. "
                        "Do NOT include reasoning, thinking steps, or explanations. "
                        "Just give the final conversational reply directly. "
                        "Match the style and language of the user. "
                        "Example:\n"
                        "User: hii bhai kese ho?\n"
                        "Assistant: Main theek hoon, bhai! Tum kaise ho?\n\n"
                        "User: How are you?\n"
                        "Assistant: I'm good! How are you?"
                    )
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.7,
            "top_p": 0.9,
            "stop": ["</s>", "So,", "Okay,", "Reasoning:", "Explanation:", "I should"]
        }
        return url, headers, payload, None


    return (
        os.getenv("GPT_URL"),
        {**headers, "x-rapidapi-host": os.getenv("GPT_HOST")},
        {
            "messages": [
                {
                    "role": "system",
                    "content": "Always reply in the same language and style as the user prompt. "
                            "If user writes in Hinglish, respond in Hinglish. "
                            "If in English, respond in English."
                },
                {"role": "user", "content": prompt}
            ],
            "web_access": False
        },
        None
    )
