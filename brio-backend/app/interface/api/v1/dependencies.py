from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.infrastructure.db.session import get_db
from app.infrastructure.security.jwt import decodificar_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
) -> UsuarioModel:
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possivel validar as credencias",
        headers={"WWW-Authenticate": "Bearer"},
    )

    email = decodificar_access_token(token)
    if email is None:
        raise credenciais_invalidas
    
    repository = SQLAlchemyUsuarioRepository(db)
    usuario = repository.buscar_por_email(email)
    if usuario is None:
        raise credenciais_invalidas
    
    return usuario