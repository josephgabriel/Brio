from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.infrastructure.config import settings

def criar_access_token(email: str) -> str:
    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": email, "exp": expira_em}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decodificar_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None