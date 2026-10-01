import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from auth_routes import router as auth_router  # noqa: E402
from chat_routes import router as chat_router  # noqa: E402
from database import Base, engine  # noqa: E402
import db_models  # noqa: E402,F401  (registers the tables)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Creates tables on first run (safe to run every time - existing tables are untouched)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="EchoIntellect Backend", version="0.3.0", lifespan=lifespan)

# ==========================
# ✅ CORS Configuration
# ==========================
origins = [
    "http://localhost:5173",               # Local development
    "http://127.0.0.1:5173",
    "https://echointellect.netlify.app",   # Production Netlify URL
    os.getenv("FRONTEND_ORIGIN", ""),      # optional extra origin
]
origins = [o.rstrip("/") for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)


# ==========================
# 🏠 ROOT ENDPOINT (HEALTH CHECK)
# ==========================
@app.get("/")
def root():
    return {
        "status": "running",
        "message": "🚀 EchoIntellect Backend API is live!",
        "version": "0.3.0",
        "docs": "/docs",
    }
