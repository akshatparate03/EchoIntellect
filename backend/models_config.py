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
                    "content": "Always reply in the same language as the input.\n\n"
                               "Match Hinglish with Hinglish, English with English.\n\n"
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
                    "parts": [{"text": "Always reply in the same language as the input.\n\n"
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
        headers = {
            "x-rapidapi-key": rapidapi_key,
            "x-rapidapi-host": os.getenv("DEEPSEEK_HOST"),
            "Content-Type": "application/json"
        }

        payload = {
            "model": "DeepSeek-V3-0324",
            "messages": [
                {
                    "role": "system",
                    "content": "Always reply in the same language as the input.\n\n"
                               "Match Hinglish with Hinglish, English with English.\n\n"
                               "Give detailed, long, and comprehensive responses."
                },
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2048,
            "temperature": 0.7
        }
        return url, headers, payload, None



    return (
        os.getenv("GPT_URL"),
        {**headers, "x-rapidapi-host": os.getenv("GPT_HOST")},
        {
            "messages": [
                {
                    "role": "system",
                    "content": "Always reply in the same language as the input. "
                               "Match Hinglish with Hinglish, English with English.\n\n"
                },
                {"role": "user", "content": prompt}
            ],
            "web_access": False
        },
        None
    )