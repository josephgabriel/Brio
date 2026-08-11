# app/interface/api/v1/routers/topicos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.criar_topico import CriarTopico
from app.application.use_cases.deletar_topico import DeletarTopico
from app.application.use_cases.listar_topico import ListarTopicos
from app.domain.exceptions import DisciplinaNaoEncontradaError, TopicoNaoEncontradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.disciplina_repository import (
    SQLAlchemyDisciplinaRepository,
)
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.topico import TopicoCreateSchema, TopicoResponseSchema

router = APIRouter(tags=["topicos"])


@router.post(
    "/api/v1/disciplinas/{disciplina_id}/topicos",
    response_model=TopicoResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar(
    disciplina_id: int,
    dados: TopicoCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    topico_repository = SQLAlchemyTopicoRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)
    use_case = CriarTopico(topico_repository, disciplina_repository)

    try:
        topico = use_case.executar(
            usuario_id=usuario.id, disciplina_id=disciplina_id, nome=dados.nome
        )
    except DisciplinaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return topico


@router.get(
    "/api/v1/disciplinas/{disciplina_id}/topicos", response_model=list[TopicoResponseSchema]
)
def listar(
    disciplina_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyTopicoRepository(db)
    use_case = ListarTopicos(repository)
    return use_case.executar(disciplina_id=disciplina_id)


@router.delete("/api/v1/topicos/{topico_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    topico_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyTopicoRepository(db)
    use_case = DeletarTopico(repository)
    try:
        use_case.executar(topico_id=topico_id, usuario_id=usuario.id)
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))