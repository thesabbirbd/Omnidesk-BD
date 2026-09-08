import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import bcrypt
import jwt
from app.core.config import settings


def get_password_hash(password: str) -> str:
    """Hash plain password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def validate_password_strength(password: str) -> Optional[str]:
    """
    Validate password complexity:
    - Minimum 8 characters
    - Must contain at least one digit
    - Must contain at least one letter
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r"\d", password):
        return "Password must contain at least one numeric digit."
    if not re.search(r"[a-zA-Z]", password):
        return "Password must contain at least one alphabetic letter."
    return None


def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "type": "access",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT refresh token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "type": "refresh",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except jwt.PyJWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and validate refresh token."""
    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except jwt.PyJWTError:
        return None
