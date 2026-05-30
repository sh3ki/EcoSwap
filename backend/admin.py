import hmac
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from config import settings
from database import get_overall_stats, get_sessions

router   = APIRouter(tags=["admin"])
security = HTTPBearer()


# ── Auth helpers ──────────────────────────────────────────────────────────────

def _create_token(username: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": username, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


async def get_current_admin(
    creds: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    try:
        payload = jwt.decode(
            creds.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        username: str = payload.get("sub", "")
        if username != settings.ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Request / Response schemas ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/login")
async def admin_login(req: LoginRequest) -> dict[str, Any]:
    # hmac.compare_digest is timing-safe — prevents timing-based brute-force
    username_ok = hmac.compare_digest(req.username, settings.ADMIN_USERNAME)
    password_ok = hmac.compare_digest(req.password, settings.ADMIN_PASSWORD)
    if not (username_ok and password_ok):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": _create_token(req.username), "token_type": "bearer"}


@router.get("/stats")
async def admin_stats(admin: str = Depends(get_current_admin)) -> dict[str, Any]:
    return get_overall_stats()


@router.get("/sessions")
async def admin_sessions(
    limit: int = 50,
    admin: str = Depends(get_current_admin),
) -> list[dict[str, Any]]:
    return get_sessions(limit)
