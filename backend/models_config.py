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
        url = os.getenv("GPT_URL", "https://chatgpt-42.p.rapidapi.com/gpt4")
        headers["x-rapidapi-host"] = os.getenv("GPT_HOST", "chatgpt-42.p.rapidapi.com")
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "web_access": False
        }
        return url, headers, payload

    if model == "gemini":
        # Replace host/path with the actual RapidAPI Gemini endpoint you use
        url = "https://google-gemini-pro.p.rapidapi.com/v1/text"
        headers["x-rapidapi-host"] = "google-gemini-pro.p.rapidapi.com"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        return url, headers, payload

    if model == "perplexity":
        # Replace with Perplexity RapidAPI endpoint
        url = "https://perplexity-ai.p.rapidapi.com/chat/completions"
        headers["x-rapidapi-host"] = "perplexity-ai.p.rapidapi.com"
        payload = {"model":"llama-3","messages":[{"role":"user","content":prompt}]}
        return url, headers, payload

    if model == "deepseek":
        # Replace with DeepSeek RapidAPI endpoint
        url = "https://deepseek.p.rapidapi.com/chat/completions"
        headers["x-rapidapi-host"] = "deepseek.p.rapidapi.com"
        payload = {"model":"deepseek-chat","messages":[{"role":"user","content":prompt}]}
        return url, headers, payload

    # Default: echo back
    return "https://chatgpt-42.p.rapidapi.com/aitohuman", {**headers, "x-rapidapi-host":"chatgpt-42.p.rapidapi.com"}, {"text": prompt}
