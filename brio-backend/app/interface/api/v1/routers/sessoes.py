from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.finalizar_sessao import FinalizarSessao
from app.application.use_cases.iniciar_sessao import IniciarSessao
from app.application.use_cases.listar_sessao import ListarSessoes
from app.application.use_cases.obter_sessao import ObterSessao
from app.application.use_cases.cancelar_sessao import CancelarSessao
from app.domain.exceptions import (
    ProvaNaoEncontradaError,
    SessaoJaFinalizadaError,
    SessaoNaoEncontradaError,
    DisciplinaNaoEncontradaError,
    TopicoNaoEncontradoError,
)
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_current_user
from app.interface.api.v1.schemas.sessao_estudo import (
    SessaoFinalizarSchema,
    SessaoIniciarSchema,
    SessaoResponseSchema,
)

from app.infrastructure.db.repositories.disciplina_repository import SQLAlchemyDisciplinaRepository
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository

router = APIRouter(prefix="/api/v1/sessoes", tags=["sessoes"])


@router.post("", response_model=SessaoResponseSchema, status_code=status.HTTP_201_CREATED)
def iniciar(
    dados: SessaoIniciarSchema,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)
    topico_repository = SQLAlchemyTopicoRepository(db)
    use_case = IniciarSessao(sessao_repository, disciplina_repository, topico_repository)

    try:
        sessao = use_case.executar(usuario_id=usuario.id, **dados.model_dump())
    except (ProvaNaoEncontradaError, DisciplinaNaoEncontradaError, TopicoNaoEncontradoError) as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return SessaoResponseSchema.from_model(sessao)


@router.patch("/{sessao_id}/finalizar", response_model=SessaoResponseSchema)
def finalizar(
    sessao_id: int,
    dados: SessaoFinalizarSchema,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    revisao_repository = SQLAlchemyRevisaoRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)
    use_case = FinalizarSessao(sessao_repository, revisao_repository, disciplina_repository)

    try:
        sessao = use_case.executar(
            sessao_id=sessao_id, usuario_id=usuario.id, **dados.model_dump()
        )
    except SessaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except SessaoJaFinalizadaError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))

    return SessaoResponseSchema.from_model(sessao)


@router.get("", response_model=list[SessaoResponseSchema])
def listar(
    prova_id: int | None = None,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemySessaoEstudoRepository(db)
    use_case = ListarSessoes(repository)
    sessoes = use_case.executar(usuario_id=usuario.id, prova_id=prova_id)
    return [SessaoResponseSchema.from_model(sessao) for sessao in sessoes]


@router.get("/{sessao_id}", response_model=SessaoResponseSchema)
def obter(
    sessao_id: int,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemySessaoEstudoRepository(db)
    use_case = ObterSessao(repository)

    try:
        sessao = use_case.executar(sessao_id=sessao_id, usuario_id=usuario.id)
    except SessaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return SessaoResponseSchema.from_model(sessao)

@router.delete("/{sessao_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar(
    sessao_id: int,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemySessaoEstudoRepository(db)
    use_case = CancelarSessao(repository)

    try:
        use_case.executar(sessao_id=sessao_id, usuario_id=usuario.id)
    except SessaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except SessaoJaFinalizadaError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))