import os
from dotenv import load_dotenv
from google import genai
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

    # ==============================
<<<<<<< HEAD
    # GPT (Updated to new model)
=======
    # GPT
>>>>>>> d3dfa7b6d5da9e36760ec0927c030f8edb10ac08
    # ==============================
    if model == "gpt":
        url = os.getenv("GPT_URL")
        headers["x-rapidapi-host"] = os.getenv("GPT_HOST")
        payload = {
<<<<<<< HEAD
            "model": "GPT-5-mini",
=======
>>>>>>> d3dfa7b6d5da9e36760ec0927c030f8edb10ac08
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an advanced AI model named ChatGPT 5.\n\n"
                        "Always give clear, deep, and structured explanations with proper examples.\n\n"
                        "IMPORTANT: Detect the user's language and respond in THE SAME LANGUAGE.\n"
                        "- If user writes in English, respond in English\n"
                        "- If user writes in Hinglish (Hindi written in English), respond in Hinglish\n"
                        "- NEVER respond in Devanagari (Hindi) script\n\n"
                        "Provide proper spacing and line breaks in responses specially in codes.\n\n"
                        "Respond as if explaining to a beginner clearly and completely.\n\n"
                    )
                },
                {"role": "user", "content": prompt}
<<<<<<< HEAD
            ]
=======
            ],
            "web_access": False,
            "max_tokens": 2048,
            "temperature": 0.8
>>>>>>> d3dfa7b6d5da9e36760ec0927c030f8edb10ac08
        }
        return url, headers, payload, None

    # ==============================
    # ✅ GEMINI (Fixed Language Handling)
    # ==============================
    if model == "gemini":
        api_key = os.getenv("GEMINI_KEY")
        if not api_key:
            raise ValueError("❌ GEMINI_KEY not found in .env file")

        client = genai.Client(api_key=api_key)

        try:
            instruction = (
                "You are Gemini 2.5 Flash, an advanced AI assistant.\n\n"
                "🔴 CRITICAL LANGUAGE RULE:\n"
                "- Carefully detect the language of the user's input\n"
                "- Respond in EXACTLY THE SAME LANGUAGE as the user\n"
                "- If user writes in English → respond in English\n"
                "- If user writes in Hinglish (Hindi using Roman/English script) → respond in Hinglish\n"
                "- NEVER use Devanagari (हिंदी) script\n"
                "- NEVER translate the user's language\n\n"
                "Always give clear, deep, and structured explanations with proper examples.\n"
                "Provide proper spacing and line breaks in responses specially in codes.\n"
                "Respond as if explaining to a beginner clearly and completely.\n\n"
                f"User's question: {prompt}"
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=instruction,
                config={
                    "max_output_tokens": 2048,
                    "temperature": 0.7
                }
            )

            text = getattr(response, "text", "").strip() or "[No response from Gemini]"
            return None, None, {"response_text": text}, None

        except Exception as e:
            return None, None, {"error": str(e)}, None

    # ==============================
    # PERPLEXITY
    # ==============================
    if model == "perplexity":
        url = os.getenv("PERPLEXITY_URL")
        headers["x-rapidapi-host"] = os.getenv("PERPLEXITY_HOST")

        payload = {
            "content": (
                "You are an advanced AI model named Perplexity Sonar Reasoning Pro.\n\n"
                "IMPORTANT: Detect the user's language and respond in THE SAME LANGUAGE.\n"
                "- If user writes in English, respond in English\n"
                "- If user writes in Hinglish (Hindi written in English), respond in Hinglish\n"
                "- NEVER respond in Devanagari (Hindi) script\n\n"
                "Always give long, detailed, and deeply explained answers with examples where possible.\n"
                "Provide proper spacing and line breaks in responses specially in codes.\n"
                "Explain concepts like a teacher explaining to a beginner.\n\n"
                + prompt
            ),
            "max_tokens": 2048,
            "temperature": 0.8
        }

        return url, headers, payload, None

    # ==============================
    # DEEPSEEK
    # ==============================
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
                    "content": (
                        "You are an advanced AI model named DeepSeek V3.\n\n"
                        "IMPORTANT: Detect the user's language and respond in THE SAME LANGUAGE.\n"
                        "- If user writes in English, respond in English\n"
                        "- If user writes in Hinglish (Hindi written in English), respond in Hinglish\n"
                        "- NEVER respond in Devanagari (Hindi) script\n\n"
                        "Always give long, detailed, and deeply explained answers with examples where possible.\n"
                        "Provide proper spacing and line breaks in responses specially in codes.\n"
                        "Explain concepts like a teacher explaining to a beginner.\n\n"
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2048,
            "temperature": 0.8
        }
        return url, headers, payload, None

    # ==============================
    # DEFAULT (GPT fallback)
    # ==============================
    return (
        os.getenv("GPT_URL"),
        {**headers, "x-rapidapi-host": os.getenv("GPT_HOST")},
        {
<<<<<<< HEAD
            "model": "GPT-5-mini",
=======
>>>>>>> d3dfa7b6d5da9e36760ec0927c030f8edb10ac08
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an advanced AI model named ChatGPT 5.\n\n"
                        "Always give clear, deep, and structured explanations with proper examples.\n\n"
                        "IMPORTANT: Detect the user's language and respond in THE SAME LANGUAGE.\n"
                        "- If user writes in English, respond in English\n"
                        "- If user writes in Hinglish (Hindi written in English), respond in Hinglish\n"
                        "- NEVER respond in Devanagari (Hindi) script\n\n"
                        "Provide proper spacing and line breaks in responses specially in codes.\n\n"
                        "Respond as if explaining to a beginner clearly and completely.\n\n"
                    )
                },
                {"role": "user", "content": prompt}
<<<<<<< HEAD
            ]
=======
            ],
            "web_access": False
>>>>>>> d3dfa7b6d5da9e36760ec0927c030f8edb10ac08
        },
        None
    )