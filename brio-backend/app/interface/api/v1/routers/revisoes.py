from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date


from app.application.use_cases.concluir_revisao import ConcluirRevisao
from app.application.use_cases.listar_revisoes import ListarRevisoes, ListarRevisoesDeHoje
from app.application.use_cases.obter_revisao import ObterRevisao
from app.domain.exceptions import RevisaoJaConcluidaError, RevisaoNaoEncontradaError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_current_user
from app.interface.api.v1.schemas.revisao import RevisaoResponseSchema

router = APIRouter(prefix="/api/v1/revisoes", tags=["revisoes"])


@router.get("", response_model=list[RevisaoResponseSchema])
def listar(
    prova_id: int | None = None,
    apenas_pendentes: bool = False,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyRevisaoRepository(db)
    use_case = ListarRevisoes(repository)
    revisoes = use_case.executar(
        usuario_id=usuario.id,
        prova_id=prova_id,
        apenas_pendentes=apenas_pendentes,
        data_inicio=data_inicio,
        data_fim=data_fim,
    )
    return [RevisaoResponseSchema.from_model(revisao) for revisao in revisoes]


@router.get("/hoje", response_model=list[RevisaoResponseSchema])
def listar_de_hoje(
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyRevisaoRepository(db)
    use_case = ListarRevisoesDeHoje(repository)
    revisoes = use_case.executar(usuario_id=usuario.id)
    return [RevisaoResponseSchema.from_model(revisao) for revisao in revisoes]


@router.get("/{revisao_id}", response_model=RevisaoResponseSchema)
def obter(
    revisao_id: int,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyRevisaoRepository(db)
    use_case = ObterRevisao(repository)

    try:
        revisao = use_case.executar(revisao_id=revisao_id, usuario_id=usuario.id)
    except RevisaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return RevisaoResponseSchema.from_model(revisao)


@router.patch("/{revisao_id}/concluir", response_model=RevisaoResponseSchema)
def concluir(
    revisao_id: int,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyRevisaoRepository(db)
    use_case = ConcluirRevisao(repository)

    try:
        revisao = use_case.executar(revisao_id=revisao_id, usuario_id=usuario.id)
    except RevisaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except RevisaoJaConcluidaError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))

    return RevisaoResponseSchema.from_model(revisao)