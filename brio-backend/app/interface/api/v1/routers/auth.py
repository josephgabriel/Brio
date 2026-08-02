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
    RedefinirSenhaSchema,
    SolicitarRedefinicaoSchema,
    VerificarEmailSchema,
)
from app.application.use_cases.enviar_verificacao_email import EnviarVerificacaoEmail
from app.application.use_cases.redefinir_senha import RedefinirSenha
from app.application.use_cases.solicitar_redefinicao_senha import SolicitarRedefinicaoSenha
from app.application.use_cases.verificar_email import VerificarEmail
from app.domain.exceptions import TokenInvalidoError
from app.infrastructure.email.email_sender import obter_email_sender
from app.infrastructure.metricas.registrador_eventos import RegistradorEventos
from app.domain.exceptions import ReenvioMuitoRecenteError

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UsuarioResponseSchema, status_code=status.HTTP_201_CREATED)
def registrar(dados: UsuarioCreateSchema, db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = RegistrarUsuario(repository)

    try:
        usuario = use_case.executar(nome=dados.nome, email=dados.email, senha=dados.senha)
    except EmailJaCadastradoError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))

    EnviarVerificacaoEmail(obter_email_sender()).executar(usuario)
    RegistradorEventos(db).registrar("usuario_registrado", usuario.id)

    return usuario


@router.post("/login", response_model=TokenSchema)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = AutenticarUsuario(repository)

    try:
        usuario = use_case.executar(email=form.username, senha=form.password)
    except CredenciaisInvalidasError as erro:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(erro))

    if not usuario.email_verificado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Confirme seu email antes de fazer login.",
        )
    
    token = criar_access_token(email=usuario.email)
    RegistradorEventos(db).registrar("login", usuario.id)
    return TokenSchema(access_token=token)


@router.get("/me", response_model=UsuarioResponseSchema)
def me(usuario: UsuarioModel = Depends(get_current_user)):
    return usuario

@router.post("/verificar-email", status_code=status.HTTP_204_NO_CONTENT)
def verificar_email(dados: VerificarEmailSchema, db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = VerificarEmail(repository)

    try:
        use_case.executar(dados.token)
    except TokenInvalidoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))


@router.post("/esqueci-senha", status_code=status.HTTP_204_NO_CONTENT)
def esqueci_senha(dados: SolicitarRedefinicaoSchema, db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = SolicitarRedefinicaoSenha(repository, obter_email_sender())
    try:
        use_case.executar(dados.email)
    except ReenvioMuitoRecenteError as erro:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(erro))
    # Sempre 204, exista ou não o email -- mesma lógica de segurança
    # de não revelar quais emails estão cadastrados.


@router.post("/redefinir-senha", status_code=status.HTTP_204_NO_CONTENT)
def redefinir_senha(dados: RedefinirSenhaSchema, db: Session = Depends(get_db)):
    repository = SQLAlchemyUsuarioRepository(db)
    use_case = RedefinirSenha(repository)

    try:
        use_case.executar(dados.token, dados.nova_senha)
    except TokenInvalidoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))
    
@router.post("/reenviar-verificacao", status_code=status.HTTP_204_NO_CONTENT)
def reenviar_verificacao(
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        EnviarVerificacaoEmail(obter_email_sender()).executar(usuario)
    except ReenvioMuitoRecenteError as erro:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(erro))