import hashlib
import hmac
import os
import re
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from db_models import User

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "")
if len(JWT_SECRET) < 16:
    raise RuntimeError("JWT_SECRET environment variable is missing or too short (use 32+ random chars).")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_DAYS = 7
SIGNUP_TOKEN_MINUTES = 15

_bearer = HTTPBearer(auto_error=False)

GMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@gmail\.com$", re.IGNORECASE)


# ---------- passwords ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def password_problems(password: str) -> list[str]:
    """Same rules as the signup form."""
    problems = []
    if not (8 <= len(password) <= 16):
        problems.append("8-16 characters")
    if not re.search(r"[A-Z]", password):
        problems.append("one uppercase letter")
    if not re.search(r"[a-z]", password):
        problems.append("one lowercase letter")
    if not re.search(r"[0-9]", password):
        problems.append("one number")
    if not re.search(r"[@#$&!]", password):
        problems.append("one special character (@#$&!)")
    if re.search(r"\s", password):
        problems.append("no spaces")
    return problems


# ---------- OTP ----------
def hash_otp(email: str, otp: str) -> str:
    return hmac.new(JWT_SECRET.encode(), f"{email}:{otp}".encode(), hashlib.sha256).hexdigest()


# ---------- tokens ----------
def _encode(payload: dict, expires: timedelta) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({**payload, "iat": now, "exp": now + expires}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_access_token(user: User) -> str:
    return _encode({"sub": str(user.id), "type": "access"}, timedelta(days=ACCESS_TOKEN_DAYS))


def create_signup_token(email: str, name: str) -> str:
    return _encode({"email": email, "name": name, "type": "signup"}, timedelta(minutes=SIGNUP_TOKEN_MINUTES))


def decode_token(token: str, expected_type: str) -> dict:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")
    if data.get("type") != expected_type:
        raise HTTPException(status_code=401, detail="Invalid token.")
    return data


# ---------- current user dependency ----------
def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(status_code=401, detail="Login required.")
    data = decode_token(creds.credentials, "access")
    user = db.get(User, int(data["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please login again.")
    return user
