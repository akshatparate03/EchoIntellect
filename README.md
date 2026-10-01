<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=EchoIntellect&fontSize=70&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Ask%20Once.%20Learn%20from%20Many%20AI%20Minds.&descAlignY=60&descSize=20" width="100%"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-echointellect.netlify.app-0ea5a5?style=for-the-badge&logoColor=white)](https://echointellect.netlify.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-EchoIntellect-181717?style=for-the-badge&logo=github)](https://github.com/akshatparate03/EchoIntellect.git)
[![Instagram](https://img.shields.io/badge/Instagram-@echointellect.in-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/echointellect.in)
[![X](https://img.shields.io/badge/X-@EchoIntellectAI-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/EchoIntellectAI)

<br/>

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-AI%20Gateway-8B5CF6?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)

</div>

---

## 📖 Table of Contents

- [🌟 About EchoIntellect](#-about-echointellect)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [⚡ Tech Stack](#-tech-stack)
- [✨ Core Features](#-core-features)
- [🔐 Security Features](#-security-features)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Endpoints](#-api-endpoints)
- [🚀 Setup & Installation](#-setup--installation)
- [🔑 Environment Variables](#-environment-variables)
- [🌐 Deployment](#-deployment)
- [⚙️ Performance & Reliability](#️-performance--reliability)
- [🛡️ Security Considerations](#️-security-considerations)
- [🔧 Troubleshooting](#-troubleshooting)
- [👨‍💻 Founders](#-founders)
- [📞 Contact & Socials](#-contact--socials)

---

## 🌟 About EchoIntellect

> **EchoIntellect** is a full-stack **multi-model AI comparison platform**. Write one prompt, pick up to four AI models — **ChatGPT, Gemini, Perplexity and DeepSeek** — and watch their answers appear side by side. Every conversation is saved permanently in PostgreSQL, so your chat history is always waiting for you, just like ChatGPT.

Instead of jumping between four different chatbots, you can see how each model interprets, reasons and responds to the same question — all inside one clean, distraction-free dark interface.

```
🌍 Live at   → https://echointellect.netlify.app
⚙️ Backend   → https://echointellect-backend.onrender.com   (API docs at /docs)
📧 Contact   → echointellect.org@gmail.com
```

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                      ECHOINTELLECT ARCHITECTURE                       │
├───────────────┬────────────────────┬─────────────────────────────────┤
│   Frontend    │      Backend       │           Services              │
│  React 19     │  FastAPI (Python)  │  PostgreSQL → Neon (cloud DB)   │
│  Vite 7       │  REST API + JWT    │  AI models  → OpenRouter        │
│  TypeScript   │  SQLAlchemy 2      │  OTP mail   → Google Apps Script│
│  Tailwind 4   │  Uvicorn           │                                 │
│  Netlify      │  Render            │                                 │
└───────────────┴────────────────────┴─────────────────────────────────┘
```

### 🔄 How one prompt travels

```
 User types prompt → picks up to 4 models
          │
          ▼
 POST /api/conversations              creates the chat (saved in PostgreSQL)
 POST /api/conversations/{id}/turns   saves the prompt (turn number is row-locked)
          │
          ▼  one request per selected model
 POST /api/conversations/{id}/turns/{n}/ask   { model }
          │
          ├─ daily limit check (15 / model / day)
          ├─ last 6 turns of that model's thread added as context
          ├─ request sent to OpenRouter (model's own API key + system prompt)
          └─ reply cleaned, saved to DB, usage counter updated
          │
          ▼
 Answers stream into the model panels with a typing animation
```

```
EchoIntellect/
├── backend/        # FastAPI + PostgreSQL REST API
├── frontend/       # React + Vite + TypeScript + Tailwind
├── apps-script/    # Google Apps Script (OTP mail + Contact form mail)
├── .gitignore
└── README.md
```

---

## ⚡ Tech Stack

### 🖥️ Backend

| Technology            | Version | Purpose                                 |
| --------------------- | ------- | --------------------------------------- |
| **Python**            | 3.12    | Core language                           |
| **FastAPI**           | 0.115.0 | Web framework & auto-generated API docs |
| **Uvicorn**           | 0.30.6  | ASGI server                             |
| **SQLAlchemy**        | 2.0.36  | ORM & database access                   |
| **psycopg2-binary**   | 2.9.10  | PostgreSQL driver                       |
| **Pydantic**          | 2.9.2   | Request validation                      |
| **PyJWT**             | 2.10.1  | Token-based auth (HS256)                |
| **bcrypt**            | 4.2.1   | Password hashing                        |
| **requests**          | 2.32.3  | OpenRouter & Apps Script calls          |
| **python-dotenv**     | 1.0.0   | Environment variable loading            |
| **PostgreSQL (Neon)** | —       | Primary database (JSONB for models)     |
| **OpenRouter**        | —       | Single gateway to all AI models         |

### 🎨 Frontend

| Technology           | Version | Purpose                      |
| -------------------- | ------- | ---------------------------- |
| **React**            | 19.1    | UI library                   |
| **TypeScript**       | —       | Type-safe components & API   |
| **Vite**             | 7.1     | Build tool & dev server      |
| **TailwindCSS**      | 4.1     | Utility-first styling        |
| **React Router**     | 7.9     | Client-side routing          |
| **Node.js**          | 20.19+  | Runtime for build tools      |

### 🤖 AI Models (via OpenRouter)

| Key          | Display Name | Default OpenRouter Model ID        |
| ------------ | ------------ | ---------------------------------- |
| `gpt`        | ChatGPT      | `openai/gpt-5-mini`                |
| `gemini`     | Gemini       | `google/gemini-2.5-flash`          |
| `perplexity` | Perplexity   | `perplexity/sonar-reasoning-pro`   |
| `deepseek`   | DeepSeek     | `deepseek/deepseek-chat-v3-0324`   |

> Any model ID can be overridden from the environment (e.g. `OPENROUTER_MODEL_GPT`) if OpenRouter renames or retires a model.

---

## ✨ Core Features

<details>
<summary><b>🧠 Multi-Model Comparison</b></summary>

- Ask **one prompt** and get answers from up to **4 models** side by side
- Choose models from a selector dialog (with Select All) — selection order becomes column order
- Each model has its own panel with its own thread
- Fullscreen a single model panel for focused reading
- Responsive grid layout for mobile, tablet and desktop

</details>

<details>
<summary><b>💬 Flexible Prompting</b></summary>

- **Universal input bar** — send a follow-up to every model in the chat at once
- **Per-panel input box** — send a follow-up to just one model
- Each model keeps its own conversation context (last 6 turns, up to 2000 characters per message)
- Prompts up to 10,000 characters
- Replies are auto-detected in your language — English or Hinglish, never Devanagari

</details>

<details>
<summary><b>🗂️ Permanent Chat History</b></summary>

- Every conversation, prompt and answer is stored in PostgreSQL
- Left sidebar with chats grouped into **Today / Yesterday / Previous 7 days / Previous 30 days / Older**
- Open any old chat and continue exactly where you left off
- Auto-generated chat title from the first prompt
- Delete a chat with the dustbin icon (with confirmation)
- Mobile-friendly sidebar drawer

</details>

<details>
<summary><b>✨ Live Response Experience</b></summary>

- Animated loader while a model is thinking
- Typewriter effect for fresh answers
- Smart auto-scroll to the newest message
- **Retry** button on failed answers (failed replies don't consume your daily quota)
- Friendly error messages for expired credits, rate limits, timeouts and server errors

</details>

<details>
<summary><b>🔗 Copy & Share</b></summary>

- One-click **Copy** for any model's latest answer
- One-click **Share** creates a public, read-only link (`/share/<id>`) of a model's full thread
- Shared pages open without login
- Toast notifications for every action

</details>

<details>
<summary><b>📊 Fair Usage Limits</b></summary>

- **15 free requests per model, per user, per day** (resets at midnight IST)
- Remaining quota shown per model in the chat
- Re-opening an already answered prompt never spends quota again
- Only successful answers are counted

</details>

<details>
<summary><b>🔑 Secure Sign-up with Email OTP</b></summary>

- 3-step signup: **Send OTP → Verify OTP → Set password**
- Gmail-only accounts (`@gmail.com`)
- OTP delivered through a Google Apps Script mail service
- Live password strength checklist on the signup form
- 45-second resend timer

</details>

<details>
<summary><b>📬 Contact Form</b></summary>

- Contact page sends messages straight to the owner's inbox via Google Apps Script
- Name and email auto-filled for logged-in users

</details>

---

## 🔐 Security Features

<details>
<summary><b>🔑 JWT Authentication</b></summary>

- Stateless auth using HS256-signed JWT tokens
- Access token: **7-day expiry**
- Short-lived **signup token** (15 minutes) proves the OTP was verified before an account can be created
- Token required on every protected endpoint via a FastAPI dependency
- Frontend checks token expiry and auto-redirects to login on `401`
- Server refuses to start if `JWT_SECRET` is missing or shorter than 16 characters

</details>

<details>
<summary><b>🔒 Password Security</b></summary>

- 8–16 characters, with uppercase, lowercase, digit and one special character (`@#$&!`)
- No spaces allowed
- Rules are enforced on **both** frontend and backend
- BCrypt hashing with automatic salt — plain text is never stored

</details>

<details>
<summary><b>📧 OTP Protection</b></summary>

- 6-digit random OTP generated with `secrets`
- OTPs are stored **hashed** (HMAC-SHA256), never in plain text
- Expires in **10 minutes**
- Maximum **5 wrong attempts** per OTP
- **45-second** cooldown between OTP requests
- Constant-time comparison to prevent timing attacks
- Optional shared secret between backend and Apps Script

</details>

<details>
<summary><b>🚫 Brute-Force & Abuse Protection</b></summary>

- Login lockout after **10 failed attempts in 15 minutes** per email
- Daily per-model request limits protect your OpenRouter credits
- Prompt length capped at 10,000 characters
- Chat ownership checked on every request — users can only see their own conversations

</details>

<details>
<summary><b>🌐 CORS & Input Validation</b></summary>

- CORS whitelist: `localhost:5173`, `127.0.0.1:5173`, the Netlify production URL, and an optional `FRONTEND_ORIGIN`
- Request bodies validated with Pydantic (model keys restricted to `gpt | gemini | perplexity | deepseek`)
- SQL injection prevented through SQLAlchemy parameterized queries
- React auto-escapes rendered content

</details>

---

## 📁 Project Structure

### Backend

```
backend/
├── main.py              # FastAPI app, CORS, router registration, auto table creation
├── auth_routes.py       # check-email, send-otp, verify-otp, register, login, me
├── chat_routes.py       # conversations, turns, ask model, usage, share
├── ai_service.py        # OpenRouter calls + response cleaning/formatting
├── models_config.py     # model IDs, API keys, system prompts, request builder
├── error_handler.py     # User-friendly (Hinglish) error messages per HTTP status
├── security.py          # Password hashing, OTP hashing, JWT create/verify
├── database.py          # SQLAlchemy engine, session, connection pooling
├── db_models.py         # ORM tables
├── test_otp.py          # Test the OTP mail service without starting the app
├── requirements.txt
├── .python-version      # 3.12.3
└── .env                 # Secrets (never committed)
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatSidebar.tsx          # Grouped chat history + delete
│   │   ├── DotsLoader.tsx           # Loading animation
│   │   ├── Footer.tsx
│   │   ├── LogoutToast.tsx          # Toast notifications
│   │   ├── ModelPanel.tsx           # One model's thread, copy, share, retry
│   │   ├── ModelSelectorDialog.tsx  # Pick up to 4 models
│   │   ├── Navbar.tsx
│   │   ├── PromptInput.tsx
│   │   └── TypewriterText.tsx       # Typing animation
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── Chat.tsx                 # Multi-panel chat workspace
│   │   ├── Contact.tsx
│   │   ├── Home.tsx                 # Landing + first prompt
│   │   ├── Login.tsx                # Sign in / OTP sign up
│   │   └── ShareView.tsx            # Public shared chat page
│   ├── utils/
│   │   ├── api.ts                   # Typed API client
│   │   ├── auth.ts                  # Sign in / sign up / sign out helpers
│   │   └── session.ts               # Token + user storage
│   ├── App.tsx                      # Layout shell
│   ├── router.tsx                   # Routes
│   ├── main.tsx                     # Entry point
│   └── styles.css                   # Global dark theme
├── index.html
├── netlify.toml                     # Netlify build config
├── package.json
└── vite.config.js
```

### Frontend Routes

| Route         | Page      | Access            |
| ------------- | --------- | ----------------- |
| `/`           | Home      | Public            |
| `/about`      | About     | Public            |
| `/contact`    | Contact   | Public            |
| `/login`      | Login     | Public            |
| `/chat`       | My Chats  | Login required    |
| `/chat/:id`   | Chat      | Login required    |
| `/share/:id`  | ShareView | Public            |

---

## 🗄️ Database Schema

Tables are created automatically on first backend start — nothing to create manually.

### 👤 `users`

| Column          | Type                 | Description              |
| --------------- | -------------------- | ------------------------ |
| `id`            | BIGSERIAL PK         | User ID                  |
| `email`         | VARCHAR(255) UNIQUE  | Login identifier (Gmail) |
| `name`          | VARCHAR(120)         | Full name                |
| `password_hash` | VARCHAR(255)         | BCrypt hash              |
| `created_at`    | TIMESTAMPTZ          | Registration time        |

### 📧 `email_otps`

| Column       | Type              | Description                    |
| ------------ | ----------------- | ------------------------------ |
| `email`      | VARCHAR(255) PK   | One active OTP per email       |
| `name`       | VARCHAR(120)      | Name entered during signup     |
| `code_hash`  | VARCHAR(128)      | HMAC-SHA256 of the OTP         |
| `attempts`   | INT               | Wrong attempts so far          |
| `expires_at` | TIMESTAMPTZ       | OTP expiry (10 min)            |
| `sent_at`    | TIMESTAMPTZ       | Used for resend cooldown       |

### 💬 `conversations`

| Column       | Type                | Description                          |
| ------------ | ------------------- | ------------------------------------ |
| `id`         | UUID PK             | Conversation ID                      |
| `user_id`    | BIGINT FK → users   | Owner (cascade delete)               |
| `title`      | VARCHAR(200)        | Auto-generated from first prompt     |
| `models`     | JSONB               | e.g. `["gpt", "gemini"]`             |
| `created_at` | TIMESTAMPTZ         | Creation time                        |
| `updated_at` | TIMESTAMPTZ (index) | Used to sort the sidebar             |

### 📝 `messages`

| Column            | Type                    | Description                                              |
| ----------------- | ----------------------- | -------------------------------------------------------- |
| `id`              | BIGSERIAL PK            | Message ID                                               |
| `conversation_id` | UUID FK → conversations | Parent chat (cascade delete)                             |
| `turn`            | INT                     | Turn number inside the chat                              |
| `role`            | VARCHAR(10)             | `user` or `assistant`                                    |
| `model`           | VARCHAR(20) NULL        | User row: `NULL` = sent to all models, else one model. Assistant row: the answering model |
| `content`         | TEXT                    | Prompt or answer                                         |
| `is_error`        | BOOLEAN                 | Marks failed model replies (retry-able)                  |
| `created_at`      | TIMESTAMPTZ             | Timestamp                                                |

> Unique partial indexes guarantee **one prompt per turn** and **one answer per model per turn**, even with parallel requests.

### 📊 `usage_counts`

| Column    | Type                | Description                  |
| --------- | ------------------- | ---------------------------- |
| `user_id` | BIGINT PK, FK       | User                         |
| `day`     | DATE PK             | Day (IST)                    |
| `model`   | VARCHAR(20) PK      | Model key                    |
| `count`   | INT                 | Successful requests that day |

### 🔗 `shares`

| Column       | Type              | Description                                |
| ------------ | ----------------- | ------------------------------------------ |
| `id`         | VARCHAR(12) PK    | Public share ID                            |
| `user_id`    | BIGINT FK → users | Who created the link                       |
| `model`      | VARCHAR(20)       | Model whose thread is shared               |
| `items`      | JSONB             | `[{ "prompt": "...", "response": "..." }]` |
| `created_at` | TIMESTAMPTZ       | Creation time                              |

---

## 🔌 API Endpoints

Interactive docs are available at **`/docs`** (Swagger UI) when the backend is running.

### 🏠 General

| Method | Endpoint | Description                            |
| ------ | -------- | -------------------------------------- |
| `GET`  | `/`      | Health check → `{"status": "running"}` |

### 🔑 Authentication — `/api/auth`

| Method | Endpoint       | Auth | Description                                           |
| ------ | -------------- | ---- | ----------------------------------------------------- |
| `POST` | `/check-email` | ❌   | Check if an email is already registered               |
| `POST` | `/send-otp`    | ❌   | Validate name + Gmail and email a 6-digit OTP         |
| `POST` | `/verify-otp`  | ❌   | Verify OTP → returns a short-lived `signup_token`     |
| `POST` | `/register`    | ❌   | Create account with password + `signup_token`         |
| `POST` | `/login`       | ❌   | Login → returns JWT + user info                       |
| `GET`  | `/me`          | ✅   | Get the current user                                  |

### 💬 Conversations — `/api`

| Method   | Endpoint                               | Description                                      |
| -------- | -------------------------------------- | ------------------------------------------------ |
| `GET`    | `/conversations`                       | List the user's chats (latest 300, newest first) |
| `POST`   | `/conversations`                       | Create a chat with 1–4 models                    |
| `GET`    | `/conversations/{id}`                  | Full chat with all turns and model answers       |
| `DELETE` | `/conversations/{id}`                  | Delete a chat and all its messages               |
| `POST`   | `/conversations/{id}/turns`            | Save a prompt (to all models or one model)       |
| `POST`   | `/conversations/{id}/turns/{n}/ask`    | Get one model's reply for turn `n`               |

### 📊 Usage & Share — `/api`

| Method | Endpoint      | Auth | Description                                   |
| ------ | ------------- | ---- | --------------------------------------------- |
| `GET`  | `/usage`      | ✅   | Daily limit + remaining requests per model    |
| `POST` | `/share`      | ✅   | Create a public share link for a model thread |
| `GET`  | `/share/{id}` | ❌   | Read a shared chat                            |

### Example — ask a model

```http
POST /api/conversations/{id}/turns/1/ask
Authorization: Bearer <token>
Content-Type: application/json

{ "model": "gemini" }
```

```json
{ "text": "…model answer…", "is_error": false, "remaining": 14 }
```

---

## 🚀 Setup & Installation

### 📋 Prerequisites

| Requirement | Version        | Download                                     |
| ----------- | -------------- | -------------------------------------------- |
| Python      | 3.12 (3.10+ ok) | [python.org](https://www.python.org)         |
| Node.js     | 20.19+ or 22   | [nodejs.org](https://nodejs.org)             |
| Git         | Any            | [git-scm.com](https://git-scm.com)           |

> PostgreSQL does **not** need to be installed locally — a free [Neon](https://neon.tech) database is used.

### 📦 Running Services — Port Reference

| Service            | Port | URL                   |
| ------------------ | ---- | --------------------- |
| Frontend (Vite)    | 5173 | http://localhost:5173 |
| Backend (FastAPI)  | 8000 | http://localhost:8000 |
| API Docs (Swagger) | 8000 | http://localhost:8000/docs |

---

### 1️⃣ Create the Database (Neon, free)

1. Sign up at [neon.tech](https://neon.tech) → **Create project** (name: `echointellect`)
2. Copy the **connection string** from the dashboard:
   `postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`
3. This goes into `DATABASE_URL`. Tables are created automatically when the backend starts.

> Prefer local PostgreSQL? Run `CREATE DATABASE echointellect;` and use
> `postgresql://postgres:PASSWORD@localhost:5432/echointellect`

---

### 2️⃣ Deploy the Google Apps Script (OTP + Contact mail)

One script handles both OTP emails and the Contact form, so the same URL is used in both places.

1. Open [script.google.com](https://script.google.com) → **New project**
2. Delete the default code and paste the full contents of `apps-script/Code.gs`
3. In `SETTINGS` at the top:
   - `OWNER_EMAIL` — inbox that should receive Contact form messages
   - `SECRET` — any long random text (must match `OTP_SCRIPT_SECRET` in the backend)
4. Save → select function **`authorizeAndTest`** → **Run** → grant permissions
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the `/exec` URL. Opening it in a browser should show `{"ok":true,"service":"EchoIntellect mail script is running"}`

> After editing the script later, use **Deploy → Manage deployments → Edit → New version → Deploy**. The URL stays the same.
> A free Gmail account can send roughly 100 mails/day.

---

### 3️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate           # Windows
source venv/bin/activate        # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Create your .env file (see Environment Variables section below)

# Start the server
uvicorn main:app --reload --port 8000
```

> Backend starts at → **http://localhost:8000** &nbsp;|&nbsp; Docs → **http://localhost:8000/docs**

**Test the OTP mailer without starting the app:**

```bash
python test_otp.py yourname@gmail.com
```

---

### 4️⃣ Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create frontend/.env (see below), then:
npm run dev

# Build for production
npm run build
```

> Frontend starts at → **http://localhost:5173** — keep both terminals running.

---

### 5️⃣ Quick Test Checklist

1. **Login → Create account** → name + `@gmail.com` → **Send OTP** → verify → set password
2. On Home, type a prompt → choose models → **Proceed** → answers appear
3. Reload or re-login → open **My Chats** → your chat is still there
4. Delete a chat from the sidebar with the dustbin icon
5. Click **Share** on a model panel → open the copied link in a private window
6. Send a message from the **Contact** page → check your inbox

> 💡 **Save credits while testing:** set `MOCK_AI=true` in `backend/.env` — the backend returns fake answers instead of calling OpenRouter. Remove it for real use.

---

## 🔑 Environment Variables

### Backend — `backend/.env`

```env
# ===== DATABASE (Neon / any PostgreSQL) =====
DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require

# ===== AUTH =====
# Generate: python -c "import secrets; print(secrets.token_urlsafe(48))"
JWT_SECRET=your-long-random-secret
# Google Apps Script web-app URL that emails the OTP
OTP_SCRIPT_URL=https://script.google.com/macros/s/xxxx/exec
# Must be identical to SECRET inside the Apps Script
OTP_SCRIPT_SECRET=your-apps-script-secret

# ===== URLS =====
FRONTEND_PUBLIC_URL=http://localhost:5173

# ===== AI MODELS (one OpenRouter key per model) =====
OPENROUTER_KEY_GPT=sk-or-v1-...
OPENROUTER_KEY_GEMINI=sk-or-v1-...
OPENROUTER_KEY_PERPLEXITY=sk-or-v1-...
OPENROUTER_KEY_DEEPSEEK=sk-or-v1-...
```

**Optional variables**

| Variable                  | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `MOCK_AI=true`            | Fake model answers for UI testing (no credits used)                  |
| `FRONTEND_ORIGIN`         | Extra allowed CORS origin                                            |
| `OPENROUTER_MODEL_GPT` …  | Override a model ID (also `_GEMINI`, `_PERPLEXITY`, `_DEEPSEEK`)     |
| `OPENROUTER_URL`          | Override the OpenRouter endpoint                                     |

### Frontend — `frontend/.env`

```env
# Local development
VITE_BACKEND_URL=http://localhost:8000

# Google Apps Script URL used by the Contact form
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxx/exec
```

> ⚠️ Never commit `.env` files. Both are already listed in `.gitignore`.

---

## 🌐 Deployment

### 🎨 Frontend → Netlify

Netlify reads `frontend/netlify.toml` automatically (base `frontend`, build `npm run build`, publish `dist`, Node 22).

```bash
# 1. Push the repo to GitHub
# 2. Connect the repo on netlify.com (site name: echointellect)
# 3. Add environment variables in the Netlify dashboard:
#    VITE_BACKEND_URL=https://echointellect-backend.onrender.com
#    VITE_APPS_SCRIPT_URL=<Apps Script URL>
# 4. Deploys → Trigger deploy → Clear cache and deploy
```

> Live URL: **https://echointellect.netlify.app**
> Single-page-app routing needs `public/_redirects` containing `/*  /index.html  200`

---

### ⚙️ Backend → Render

```bash
# 1. Create a new Web Service on render.com and connect the repo
# 2. Root Directory : backend
# 3. Build Command  : pip install -r requirements.txt
# 4. Start Command  : uvicorn main:app --host 0.0.0.0 --port $PORT
# 5. Service name   : echointellect-backend
# 6. Add every backend environment variable in the Render dashboard
#    (FRONTEND_PUBLIC_URL=https://echointellect.netlify.app)
```

> Free Render services sleep after ~15 minutes of inactivity — the first request afterwards can take up to a minute.

---

### 🗄️ Database → Neon

```bash
# 1. Create a project on neon.tech
# 2. Copy the connection string into DATABASE_URL (sslmode=require)
# 3. Tables are created on first backend start — no migrations to run
```

---

## ⚙️ Performance & Reliability

<details>
<summary><b>🏊 Database Connection Pooling</b></summary>

- SQLAlchemy pool: **5 connections + 5 overflow**
- `pool_pre_ping` drops dead connections (Neon/Render idle timeouts)
- Connections recycled every 5 minutes
- The DB connection is **released before the slow AI call** and reopened to save the answer

</details>

<details>
<summary><b>🔒 Concurrency Safety</b></summary>

- Row lock (`SELECT … FOR UPDATE`) on the conversation while a new turn number is assigned
- Unique partial indexes prevent duplicate prompts or duplicate model answers
- On a parallel-request collision, the already-saved answer is returned instead of failing
- Usage counter updated with a single atomic `INSERT … ON CONFLICT DO UPDATE`

</details>

<details>
<summary><b>🧹 Response Post-Processing</b></summary>

- Removes `<think>…</think>` reasoning blocks some models leak into the answer
- Cleans markdown noise and ad/footer text for readable output
- Per-model formatting rules for Gemini, DeepSeek, GPT and Perplexity
- Empty or invalid provider responses turn into clear, retry-able errors

</details>

<details>
<summary><b>🌐 Frontend Efficiency</b></summary>

- Typed API client with a single request helper and automatic session cleanup on `401`
- Per-model pending/error state — one slow model never blocks the others
- Smooth auto-scroll and fullscreen mode per model panel
- CSS-only background effects, no heavy animation libraries

</details>

---

## 🛡️ Security Considerations

<details>
<summary><b>🔐 Secrets & Keys</b></summary>

- All keys and secrets live in environment variables — never in the code
- Every model uses its **own** OpenRouter key, so one leaked or exhausted key doesn't break the rest
- Rotate any key that was ever shared, committed or posted publicly

</details>

<details>
<summary><b>🔑 Token Handling</b></summary>

- Rotate `JWT_SECRET` to invalidate all existing sessions
- The session token is stored in browser `localStorage` — keep the app free of XSS (React escaping helps)
- For stricter production setups, consider shorter token lifetimes with refresh tokens, or HttpOnly cookies

</details>

<details>
<summary><b>📈 Scaling Notes</b></summary>

- The login brute-force guard is **in-memory** — it resets on restart and isn't shared across multiple server instances. Move it to Redis if you scale out.
- Share links are public to anyone who has the URL

</details>

---

## 🔧 Troubleshooting

<details>
<summary><b>❌ `DATABASE_URL environment variable is missing`</b></summary>

- Create `backend/.env` and set `DATABASE_URL`
- Make sure you start `uvicorn` from inside the `backend` folder

</details>

<details>
<summary><b>❌ `JWT_SECRET ... missing or too short`</b></summary>

- Set a `JWT_SECRET` of 16+ characters (32+ recommended)
- Generate one: `python -c "import secrets; print(secrets.token_urlsafe(48))"`

</details>

<details>
<summary><b>❌ OTP not arriving / "Failed to send OTP" (502)</b></summary>

- The **backend terminal** prints the real reason (`OTP mail failed ...`)
- Or run `python test_otp.py yourname@gmail.com` for a clear diagnosis
- Common causes: Apps Script *Who has access* is not **Anyone**, no **New version** deployed after editing, `SECRET` ≠ `OTP_SCRIPT_SECRET`, or `authorizeAndTest` was never run
- The URL must end with `/exec`

</details>

<details>
<summary><b>❌ Browser CORS error</b></summary>

- Only `localhost:5173`, `127.0.0.1:5173` and `echointellect.netlify.app` are allowed by default
- Using another URL? Set `FRONTEND_ORIGIN=<your-url>` in the backend environment

</details>

<details>
<summary><b>❌ "Cannot reach the server"</b></summary>

- Is the backend running? Is `VITE_BACKEND_URL` correct?
- On Render's free tier the first request after idle can take ~1 minute
- Restart `npm run dev` after changing `.env`

</details>

<details>
<summary><b>❌ Model answer says "Authentication fail"</b></summary>

- That model's OpenRouter key is wrong, or it's placed in the wrong variable in `.env`

</details>

<details>
<summary><b>❌ Model answer says credits are exhausted</b></summary>

- Add credits on [openrouter.ai](https://openrouter.ai) or raise the limit on that key

</details>

<details>
<summary><b>❌ Model not found (404)</b></summary>

- OpenRouter may have renamed the model — set `OPENROUTER_MODEL_<NAME>` (e.g. `OPENROUTER_MODEL_GPT`) to a new ID from [openrouter.ai/models](https://openrouter.ai/models)

</details>

<details>
<summary><b>❌ `Daily limit reached (15)`</b></summary>

- Every user gets 15 requests per model per day (resets at midnight IST)
- Change `DAILY_LIMIT` in `backend/chat_routes.py` to adjust it

</details>

<details>
<summary><b>❌ Contact form "Failed to send"</b></summary>

- Set `VITE_APPS_SCRIPT_URL` in `frontend/.env` and restart `npm run dev`

</details>

<details>
<summary><b>❌ Netlify page refresh shows 404</b></summary>

- Add `public/_redirects` with `/*  /index.html  200`

</details>

---

## 👨‍💻 Founders

<div align="center">

| | |
| :---: | :---: |
| <img src="https://avatars.githubusercontent.com/akshatparate03" alt="Akshat Parate" width="100" style="border-radius: 50%"/> | <img src="https://ui-avatars.com/api/?name=Pooja+Soni&background=0ea5a5&color=fff&size=100&rounded=true" alt="Pooja Soni" width="100"/> |
| **Akshat Parate** | **Pooja Soni** |
| _Founder · Backend Developer_ | _Co-Founder · Frontend Developer_ |
| [![LinkedIn](https://img.shields.io/badge/LinkedIn-akshatparate03-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/akshatparate03) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-pooja--soni098-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pooja-soni098) |

</div>

> _Building the engine behind intelligence. Turning ideas into interfaces._

---

## 📞 Contact & Socials

<div align="center">

### 🌐 EchoIntellect Official

| Platform         | Link                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| 🌍 **Website**   | [echointellect.netlify.app](https://echointellect.netlify.app)                                             |
| 📧 **Email**     | [echointellect.org@gmail.com](mailto:echointellect.org@gmail.com)                                          |
| 📸 **Instagram** | [@echointellect.in](https://www.instagram.com/echointellect.in)                                            |
| 🐦 **X**         | [@EchoIntellectAI](https://x.com/EchoIntellectAI)                                                          |
| 💻 **GitHub**    | [akshatparate03/EchoIntellect](https://github.com/akshatparate03/EchoIntellect.git)                        |

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

**Built with ❤️ to compare, learn and understand AI — together.**

_Ask once. Learn from many AI minds._

[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)](https://echointellect.netlify.app)
[![GitHub Stars](https://img.shields.io/github/stars/akshatparate03/EchoIntellect?style=flat-square&color=yellow&logo=github)](https://github.com/akshatparate03/EchoIntellect)

</div>