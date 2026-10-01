import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ai_service import is_error_text, run_model
from database import get_db
from db_models import Conversation, Message, Share, UsageCount, User
from security import get_current_user

router = APIRouter(prefix="/api", tags=["chat"])

ModelKey = Literal["gpt", "gemini", "perplexity", "deepseek"]
ALL_MODELS = ["gpt", "gemini", "perplexity", "deepseek"]

DAILY_LIMIT = 15            # free requests per model per day (same as before)
HISTORY_TURNS = 6           # earlier turns sent to the model as context
HISTORY_CHARS = 2000        # max chars per earlier prompt / reply sent as context
IST = timezone(timedelta(hours=5, minutes=30))


# ---------- schemas ----------
class CreateConversationBody(BaseModel):
    models: list[ModelKey] = Field(min_length=1, max_length=4)


class CreateTurnBody(BaseModel):
    prompt: str = Field(min_length=1, max_length=10000)
    model: Optional[ModelKey] = None   # None = ask every model of the chat


class AskBody(BaseModel):
    model: ModelKey


class ShareBody(BaseModel):
    conversation_id: uuid.UUID
    model: ModelKey


# ---------- helpers ----------
def _today():
    return datetime.now(IST).date()


def _iso(dt: datetime | None) -> str | None:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if dt else None


def _conv_out(c: Conversation) -> dict:
    return {
        "id": str(c.id),
        "title": c.title,
        "models": c.models,
        "created_at": _iso(c.created_at),
        "updated_at": _iso(c.updated_at),
    }


def _get_conv(db: Session, cid: uuid.UUID, user_id: int, lock: bool = False) -> Conversation:
    q = select(Conversation).where(Conversation.id == cid, Conversation.user_id == user_id)
    if lock:
        q = q.with_for_update()
    conv = db.scalar(q)
    if not conv:
        raise HTTPException(404, "Chat not found.")
    return conv


def _used_today(db: Session, user_id: int, model: str) -> int:
    return db.scalar(
        select(UsageCount.count).where(
            UsageCount.user_id == user_id, UsageCount.day == _today(), UsageCount.model == model
        )
    ) or 0


def _bump_usage(db: Session, user_id: int, model: str):
    stmt = pg_insert(UsageCount).values(user_id=user_id, day=_today(), model=model, count=1)
    stmt = stmt.on_conflict_do_update(
        index_elements=[UsageCount.user_id, UsageCount.day, UsageCount.model],
        set_={"count": UsageCount.count + 1},
    )
    db.execute(stmt)


def _thread_pairs(db: Session, cid: uuid.UUID, model: str, before_turn: int | None = None):
    """
    [(turn, prompt, reply)] for one model's thread, oldest first.
    Only turns where the prompt was meant for this model AND it gave a real (non-error) reply.
    """
    q = select(Message).where(Message.conversation_id == cid).order_by(Message.turn, Message.id)
    if before_turn is not None:
        q = q.where(Message.turn < before_turn)
    prompts: dict[int, str] = {}
    pairs = []
    for m in db.scalars(q):
        if m.role == "user" and (m.model is None or m.model == model):
            prompts[m.turn] = m.content
        elif m.role == "assistant" and m.model == model and not m.is_error and m.turn in prompts:
            pairs.append((m.turn, prompts[m.turn], m.content))
    return pairs


# ---------- usage ----------
@router.get("/usage")
def usage(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(UsageCount.model, UsageCount.count).where(
            UsageCount.user_id == user.id, UsageCount.day == _today()
        )
    ).all()
    used = {m: c for m, c in rows}
    return {
        "limit": DAILY_LIMIT,
        "remaining": {m: max(0, DAILY_LIMIT - used.get(m, 0)) for m in ALL_MODELS},
    }


# ---------- conversations ----------
@router.get("/conversations")
def list_conversations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(300)
    ).all()
    return [_conv_out(c) for c in rows]


@router.post("/conversations")
def create_conversation(
    body: CreateConversationBody, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    models = list(dict.fromkeys(body.models))  # unique, keep selection order
    conv = Conversation(user_id=user.id, title="New chat", models=models)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return _conv_out(conv)


@router.get("/conversations/{cid}")
def get_conversation(cid: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = _get_conv(db, cid, user.id)
    turns: dict[int, dict] = {}
    msgs = db.scalars(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.turn, Message.id)
    )
    for m in msgs:
        if m.role == "user":
            turns[m.turn] = {
                "turn": m.turn,
                "prompt": m.content,
                "target": m.model,
                "created_at": _iso(m.created_at),
                "responses": {},
            }
        elif m.turn in turns and m.model:
            turns[m.turn]["responses"][m.model] = {"content": m.content, "is_error": m.is_error}
    return {**_conv_out(conv), "turns": [turns[k] for k in sorted(turns)]}


@router.delete("/conversations/{cid}")
def delete_conversation(cid: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = _get_conv(db, cid, user.id)
    db.delete(conv)
    db.commit()
    return {"ok": True}


# ---------- turns ----------
@router.post("/conversations/{cid}/turns")
def create_turn(
    cid: uuid.UUID, body: CreateTurnBody, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    conv = _get_conv(db, cid, user.id, lock=True)  # row lock -> safe turn numbering
    prompt = body.prompt.strip()
    if not prompt:
        raise HTTPException(400, "Prompt is empty.")
    if body.model and body.model not in conv.models:
        raise HTTPException(400, "This model is not part of this chat.")

    last = db.scalar(select(func.max(Message.turn)).where(Message.conversation_id == conv.id)) or 0
    turn = last + 1
    msg = Message(conversation_id=conv.id, turn=turn, role="user", model=body.model, content=prompt)
    db.add(msg)

    if conv.title == "New chat":
        one_line = re.sub(r"\s+", " ", prompt)
        conv.title = one_line[:60] + ("…" if len(one_line) > 60 else "")
    conv.updated_at = func.now()
    db.commit()
    db.refresh(msg)
    return {"turn": turn, "title": conv.title, "created_at": _iso(msg.created_at)}


@router.post("/conversations/{cid}/turns/{turn}/ask")
def ask_turn(
    cid: uuid.UUID, turn: int, body: AskBody,
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    conv = _get_conv(db, cid, user.id)
    if body.model not in conv.models:
        raise HTTPException(400, "This model is not part of this chat.")

    user_msg = db.scalar(
        select(Message).where(
            Message.conversation_id == conv.id, Message.turn == turn, Message.role == "user"
        )
    )
    if not user_msg:
        raise HTTPException(404, "Prompt not found.")
    if user_msg.model and user_msg.model != body.model:
        raise HTTPException(400, "This prompt was not sent to this model.")

    existing = db.scalar(
        select(Message).where(
            Message.conversation_id == conv.id, Message.turn == turn,
            Message.role == "assistant", Message.model == body.model,
        )
    )
    used = _used_today(db, user.id, body.model)
    if existing and not existing.is_error:   # already answered -> don't spend quota again
        return {"text": existing.content, "is_error": False, "remaining": max(0, DAILY_LIMIT - used)}

    if used >= DAILY_LIMIT:
        raise HTTPException(429, f"Daily limit reached ({DAILY_LIMIT})")

    pairs = _thread_pairs(db, conv.id, body.model, before_turn=turn)[-HISTORY_TURNS:]
    history = [(p[:HISTORY_CHARS], r[:HISTORY_CHARS]) for _, p, r in pairs]
    prompt = user_msg.content
    db.commit()   # release the DB connection while the (slow) AI call runs

    text = str(run_model(body.model, prompt, history).get("text") or "").strip()
    is_error = is_error_text(text) or not text
    if not text:
        text = "Error:- Empty response received."

    try:
        if existing:   # previous attempt was an error -> overwrite it
            row = db.get(Message, existing.id)
            if row:
                row.content, row.is_error = text, is_error
        else:
            db.add(Message(
                conversation_id=conv.id, turn=turn, role="assistant",
                model=body.model, content=text, is_error=is_error,
            ))
        if not is_error:
            _bump_usage(db, user.id, body.model)
        db.execute(
            Conversation.__table__.update().where(Conversation.id == conv.id).values(updated_at=func.now())
        )
        db.commit()
    except IntegrityError:   # same turn+model answered by a parallel request
        db.rollback()
        again = db.scalar(
            select(Message).where(
                Message.conversation_id == conv.id, Message.turn == turn,
                Message.role == "assistant", Message.model == body.model,
            )
        )
        if again:
            text, is_error = again.content, again.is_error

    remaining = max(0, DAILY_LIMIT - _used_today(db, user.id, body.model))
    return {"text": text, "is_error": is_error, "remaining": remaining}


# ---------- share ----------
@router.post("/share")
def create_share(body: ShareBody, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conv = _get_conv(db, body.conversation_id, user.id)
    if body.model not in conv.models:
        raise HTTPException(400, "This model is not part of this chat.")

    items = [{"prompt": p, "response": r} for _, p, r in _thread_pairs(db, conv.id, body.model)]
    if not items:
        raise HTTPException(400, "Nothing to share yet.")

    sid = uuid.uuid4().hex[:12]
    db.add(Share(id=sid, user_id=user.id, model=body.model, items=items))
    db.commit()

    frontend = os.getenv("FRONTEND_PUBLIC_URL", "https://echointellect.netlify.app").rstrip("/")
    return {"id": sid, "url": f"{frontend}/share/{sid}"}


@router.get("/share/{sid}")
def get_share(sid: str, db: Session = Depends(get_db)):
    rec = db.get(Share, sid)
    if not rec:
        raise HTTPException(404, "Share nahi mila")
    return {"id": rec.id, "model": rec.model, "items": rec.items, "createdAt": _iso(rec.created_at)}
