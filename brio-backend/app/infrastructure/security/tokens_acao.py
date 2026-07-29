from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.infrastructure.config import settings

def criar_token_acao(email: str, finalidade: str, expira_em_minutos: int) -> str:
    expira =datetime.now(timezone.utc) + timedelta(minutes=expira_em_minutos)
    payload = {"sub": email, "finalidade": finalidade, "exp": expira}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decodificar_token_acao(token: str, finalidade_esperada: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
    
    if payload.get("finalidade") != finalidade_esperada:
        return None
    
    return payload.get("sub")