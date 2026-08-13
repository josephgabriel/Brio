# app/interface/api/v1/routers/eventos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.atualizar_evento import AtualizarEvento
from app.application.use_cases.criar_evento import CriarEvento
from app.application.use_cases.excluir_evento import ExcluirEvento
from app.domain.exceptions import EventoNaoEncontradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.evento_calendario_repository import (
    SQLAlchemyEventoCalendarioRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.calendario import (
    EventoCreateSchema,
    EventoResponseSchema,
    EventoUpdateSchema,
)

router = APIRouter(prefix="/api/v1/eventos", tags=["eventos"])


@router.post("", response_model=EventoResponseSchema, status_code=status.HTTP_201_CREATED)
def criar(
    dados: EventoCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyEventoCalendarioRepository(db)
    use_case = CriarEvento(repository)
    return use_case.executar(usuario_id=usuario.id, **dados.model_dump())


@router.put("/{evento_id}", response_model=EventoResponseSchema)
def atualizar(
    evento_id: int,
    dados: EventoUpdateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyEventoCalendarioRepository(db)
    use_case = AtualizarEvento(repository)

    try:
        return use_case.executar(evento_id=evento_id, usuario_id=usuario.id, **dados.model_dump())
    except EventoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    evento_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyEventoCalendarioRepository(db)
    use_case = ExcluirEvento(repository)

    try:
        use_case.executar(evento_id=evento_id, usuario_id=usuario.id)
    except EventoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))