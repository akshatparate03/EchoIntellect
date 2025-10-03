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
            "messages": [{"role": "user", "content": prompt}],
            "web_access": False
        }
        return url, headers, payload, None  # no query params

    if model == "gemini":
        # RapidAPI Gemini endpoint
        url = os.getenv("GEMINI_URL")
        headers["x-rapidapi-host"] = os.getenv("GEMINI_HOST")
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ]
        }
        # Querystring required by RapidAPI Gemini
        querystring = {"key": os.getenv("GEMINI_API_KEY")}
        return url, headers, payload, querystring

    if model == "perplexity":
        # ✅ Correct RapidAPI Perplexity endpoint
        url = os.getenv("PERPLEXITY_URL")
        headers["x-rapidapi-host"] = os.getenv("PERPLEXITY_HOST")
        payload = {"content": prompt}
        return url, headers, payload, None

    if model == "deepseek":
        url = os.getenv("DEEPSEEK_URL")
        headers["x-rapidapi-host"] = os.getenv("DEEPSEEK_HOST")
        payload = {
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 100,      # chhota rakho for short responses
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False,
            "search_web": False     # 🚫 prevent fetching unnecessary web info
        }
        return url, headers, payload, None

    return (
    os.getenv("GPT_URL"),
    {**headers, "x-rapidapi-host": os.getenv("GPT_HOST")},
    {"text": prompt},
    None
)
