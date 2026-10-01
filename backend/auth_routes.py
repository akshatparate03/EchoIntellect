import logging
import os
import re
import secrets
import time
from datetime import datetime, timedelta, timezone

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from db_models import EmailOtp, User
from security import (
    GMAIL_RE, create_access_token, create_signup_token, decode_token, get_current_user,
    hash_otp, hash_password, password_problems, verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
log = logging.getLogger("uvicorn.error")

OTP_TTL_MINUTES = 10
OTP_RESEND_SECONDS = 45
OTP_MAX_ATTEMPTS = 5

# very small in-memory brute-force guard for login: {email: [timestamps]}
_FAILED_LOGINS: dict[str, list[float]] = {}
LOGIN_WINDOW_SECONDS = 15 * 60
LOGIN_MAX_FAILS = 10


# ---------- schemas ----------
class EmailBody(BaseModel):
    email: str


class SendOtpBody(BaseModel):
    name: str
    email: str


class VerifyOtpBody(BaseModel):
    email: str
    otp: str


class RegisterBody(BaseModel):
    email: str
    password: str
    signup_token: str


class LoginBody(BaseModel):
    email: str
    password: str


def _norm_email(email: str) -> str:
    return (email or "").strip().lower()


def _user_out(u: User) -> dict:
    return {"email": u.email, "name": u.name}


def _auth_response(u: User) -> dict:
    return {"token": create_access_token(u), "user": _user_out(u)}


# ---------- routes ----------
@router.post("/check-email")
def check_email(body: EmailBody, db: Session = Depends(get_db)):
    email = _norm_email(body.email)
    exists = db.scalar(select(User.id).where(User.email == email)) is not None
    return {"exists": exists}


@router.post("/send-otp")
def send_otp(body: SendOtpBody, db: Session = Depends(get_db)):
    email = _norm_email(body.email)
    name = re.sub(r"\s+", " ", body.name or "").strip()

    if not name or len(name) > 100 or not re.fullmatch(r"[A-Za-z ]+", name):
        raise HTTPException(400, "Please enter a valid first and last name.")
    if not GMAIL_RE.match(email):
        raise HTTPException(400, "Only @gmail.com emails are allowed!")
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(409, "User already exists! Please sign in instead.")

    script_url = os.getenv("OTP_SCRIPT_URL")
    if not script_url:
        raise HTTPException(500, "OTP service not configured")

    now = datetime.now(timezone.utc)
    existing = db.get(EmailOtp, email)
    if existing and (now - existing.sent_at).total_seconds() < OTP_RESEND_SECONDS:
        raise HTTPException(429, "Please wait a few seconds before requesting another OTP.")

    otp = f"{secrets.randbelow(900000) + 100000}"
    row = existing or EmailOtp(email=email)
    row.name = name
    row.code_hash = hash_otp(email, otp)
    row.attempts = 0
    row.expires_at = now + timedelta(minutes=OTP_TTL_MINUTES)
    row.sent_at = now
    db.add(row)
    # clean old expired rows
    db.execute(delete(EmailOtp).where(EmailOtp.expires_at < now - timedelta(hours=1)))
    db.commit()

    try:
        payload = {"email": email, "otp": otp, "name": name}
        secret = os.getenv("OTP_SCRIPT_SECRET")
        if secret:
            payload["secret"] = secret

        r = requests.post(script_url, json=payload, timeout=30)
        try:
            result = r.json()
        except ValueError:
            result = None

        if r.status_code < 400 and isinstance(result, dict) and result.get("ok") is True:
            return {"ok": True}

        # ---- failed: print the REAL reason in the backend terminal ----
        body = (r.text or "")[:300].replace("\n", " ")
        if result is None:
            hint = (
                "Apps Script did not return JSON (usually a Google page). Check: Deploy > Manage deployments > "
                "'Who has access' = Anyone, the URL ends with /exec, and a NEW VERSION was deployed after editing the code."
            )
        elif result.get("error") == "Forbidden":
            hint = "SECRET in Apps Script and OTP_SCRIPT_SECRET in backend/.env do not match (both must be identical, or both empty)."
        else:
            hint = f"Apps Script said: {result.get('error') or result}"
        log.error("OTP mail failed | HTTP %s | %s | response: %s", r.status_code, hint, body)
        raise RuntimeError(hint)
    except Exception as e:
        if not isinstance(e, RuntimeError):
            log.error("OTP mail request error: %s (check OTP_SCRIPT_URL / internet)", e)
        db.delete(row)
        db.commit()
        raise HTTPException(502, "Failed to send OTP. Please try again!")

    return {"ok": True}


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpBody, db: Session = Depends(get_db)):
    email = _norm_email(body.email)
    now = datetime.now(timezone.utc)
    row = db.get(EmailOtp, email)

    if not row or row.expires_at < now:
        raise HTTPException(400, "OTP expired. Please request a new one.")
    if row.attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(429, "Too many wrong attempts. Please request a new OTP.")

    if not secrets.compare_digest(row.code_hash, hash_otp(email, (body.otp or "").strip())):
        row.attempts += 1
        db.commit()
        raise HTTPException(400, "Invalid OTP! Please enter correct OTP.")

    name = row.name
    db.delete(row)
    db.commit()
    return {"signup_token": create_signup_token(email, name)}


@router.post("/register")
def register(body: RegisterBody, db: Session = Depends(get_db)):
    data = decode_token(body.signup_token, "signup")
    email = _norm_email(body.email)
    if data.get("email") != email:
        raise HTTPException(400, "Email verification mismatch. Please verify OTP again.")

    problems = password_problems(body.password)
    if problems:
        raise HTTPException(400, "Password needs: " + ", ".join(problems))

    user = User(email=email, name=data.get("name", ""), password_hash=hash_password(body.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "User already exists! Please sign in instead.")

    return {**_auth_response(user), "message": "Account created successfully!"}


@router.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    email = _norm_email(body.email)

    now = time.time()
    fails = [t for t in _FAILED_LOGINS.get(email, []) if now - t < LOGIN_WINDOW_SECONDS]
    if len(fails) >= LOGIN_MAX_FAILS:
        raise HTTPException(429, "Too many failed attempts. Please try again after some time.")

    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(404, "This email is not registered. Please create an account.")

    if not verify_password(body.password, user.password_hash):
        fails.append(now)
        _FAILED_LOGINS[email] = fails
        raise HTTPException(401, "Invalid password. Please try again.")

    _FAILED_LOGINS.pop(email, None)
    return {**_auth_response(user), "message": "Logged in successfully!"}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _user_out(user)