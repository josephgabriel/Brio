from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.application.use_cases.autenticar_usuarios import AutenticarUsuario
from app.application.use_cases.registrar_usuario import RegistrarUsuario
from app.domain.exceptions import CredenciaisInvalidasError, EmailJaCadastradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.usuario_repository import SQLAlchemyUsuarioRepository
from app.infrastructure.db.session import get_db
from app.infrastructure.security.jwt import criar_access_token
from app.interface.api.v1.dependencies import get_current_user
from app.interface.api.v1.schemas.usuario import (
    TokenSchema,
    UsuarioCreateSchema,
    UsuarioResponseSchema,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UsuarioResponseSchema, status_code=status.HTTP_201_CREATED)
def registrar(dados: UsuarioCreateSchema, db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = RegistrarUsuario(repository)

    try:
        usuario = use_case.executar(nome=dados.nome, email=dados.email, senha=dados.senha)
    except EmailJaCadastradoError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))

    return usuario


@router.post("/login", response_model=TokenSchema)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = AutenticarUsuario(repository)

    try:
        usuario = use_case.executar(email=form.username, senha=form.password)
    except CredenciaisInvalidasError as erro:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(erro))

    token = criar_access_token(email=usuario.email)
    return TokenSchema(access_token=token)


@router.get("/me", response_model=UsuarioResponseSchema)
def me(usuario: UsuarioModel = Depends(get_current_user)):
    return usuario