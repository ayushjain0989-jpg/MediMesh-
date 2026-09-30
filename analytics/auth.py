from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.getenv("JWT_SECRET", "medimesh-demo-secret-change-on-render")
JWT_ALG = "HS256"
TOKEN_HOURS = 8
bearer = HTTPBearer(auto_error=False)


def create_access_token(user: dict) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "login_id": user["login_id"],
        "role": user["role"],
        "hospital_id": user["hospital_id"],
        "name": user["name"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=TOKEN_HOURS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="Token expired. Sign in again.") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token.") from exc


def require_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing bearer token.")
    return decode_access_token(creds.credentials)
