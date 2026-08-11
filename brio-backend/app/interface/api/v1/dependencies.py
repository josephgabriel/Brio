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

def get_usuario_admin(
    usuario: UsuarioModel = Depends(get_current_user),
) -> UsuarioModel:
    """
    Dependency que exige que o usuário logado seja administrador.
    Reaproveita get_current_user (autenticação) e adiciona uma
    checagem de autorização por cima.
    """
    if not usuario.eh_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return usuario

def get_usuario_assinante(
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UsuarioModel:
    """
    Dependency que exige, além de estar autenticado, ter uma
    assinatura ativa e dentro da validade. Essa é a barreira real
    de acesso pago -- nunca decide isso com base em nada vindo do
    frontend, só consultando o banco (que só é atualizado por
    webhook do Mercado Pago).
    """
    from app.domain.regras.assinatura import assinatura_esta_valida
    from app.infrastructure.db.repositories.assinatura_repository import (
        SQLAlchemyAssinaturaRepository,
    )

    repository = SQLAlchemyAssinaturaRepository(db)
    assinatura = repository.buscar_por_usuario(usuario.id)

    valida = assinatura is not None and assinatura_esta_valida(
        assinatura.status, assinatura.data_expiracao
    )
    if not valida:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Assinatura inativa ou expirada. Contrate um plano para continuar.",
        )
    return usuario