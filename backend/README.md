# EchoIntellect Backend

python -m uvicorn main:app --reload
npm run dev

## Setup Instructions

1. **Create `.env` file** from `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Add your RapidAPI credentials** in `.env`:
   \`\`\`env
   RAPIDAPI_KEY=your_actual_rapidapi_key_here
   GPT_URL=https://chatgpt-42.p.rapidapi.com/gpt4
   GPT_HOST=chatgpt-42.p.rapidapi.com
   FRONTEND_ORIGIN=http://localhost:5173
   FRONTEND_PUBLIC_URL=http://localhost:5173
   \`\`\`

3. **Install dependencies**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Run the server**:
   \`\`\`bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   \`\`\`

## Environment Variables

- **RAPIDAPI_KEY**: Your RapidAPI key (required for live API calls)
- **GPT_URL**: ChatGPT-42 API endpoint URL
- **GPT_HOST**: ChatGPT-42 API host
- **FRONTEND_PUBLIC_URL**: e.g. https://your-netlify-site.netlify.app (for share links)
- **FRONTEND_ORIGIN**: e.g. https://your-netlify-site.netlify.app (for CORS)

## Features

- **Clean Response Extraction**: `extract_clean_text()` function in `utils.py` removes unwanted metadata and formatting
- **Environment-based Configuration**: All API endpoints configurable via `.env`
- **Debug Logging**: `[v0]` prefixed logs for easy debugging

## Notes

- Shares are stored in-memory, so links persist only while the server is running (no database per Minor-1).
- Fill correct RapidAPI hosts/paths in models_config.py for Gemini/Perplexity/DeepSeek as per your chosen APIs.
- The `extract_clean_text()` function automatically cleans responses from different AI models.
