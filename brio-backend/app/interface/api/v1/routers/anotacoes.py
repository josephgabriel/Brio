from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.obter_anotacao import ObterAnotacao
from app.application.use_cases.salvar_anotacao import SalvarAnotacao
from app.domain.exceptions import TopicoNaoEncontradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.anotacao_repository import (
    SQLAlchemyAnotacaoRepository,
)
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_current_user
from app.interface.api.v1.schemas.anotacao import AnotacaoResponseSchema, AnotacaoSalvarSchema

router = APIRouter(tags=["anotacoes"])


@router.get("/api/v1/topicos/{topico_id}/anotacao", response_model=AnotacaoResponseSchema)
def obter(
    topico_id: int,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    anotacao_repository = SQLAlchemyAnotacaoRepository(db)
    topico_repository = SQLAlchemyTopicoRepository(db)
    use_case = ObterAnotacao(anotacao_repository, topico_repository)

    try:
        anotacao = use_case.executar(topico_id=topico_id, usuario_id=usuario.id)
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return anotacao


@router.put("/api/v1/topicos/{topico_id}/anotacao", response_model=AnotacaoResponseSchema)
def salvar(
    topico_id: int,
    dados: AnotacaoSalvarSchema,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    anotacao_repository = SQLAlchemyAnotacaoRepository(db)
    topico_repository = SQLAlchemyTopicoRepository(db)
    use_case = SalvarAnotacao(anotacao_repository, topico_repository)

    try:
        anotacao = use_case.executar(
            topico_id=topico_id, usuario_id=usuario.id, conteudo_html=dados.conteudo_html
        )
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return anotacao