from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.criar_item_cronograma import CriarItemCronograma
from app.application.use_cases.excluir_item_cronograma import ExcluirItemCronograma
from app.application.use_cases.listar_cronograma import ListarCronograma
from app.domain.exceptions import (
    DisciplinaNaoEncontradaError,
    ItemCronogramaNaoEncontradoError,
)
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.cronograma_repository import (
    SQLAlchemyCronogramaRepository,
)
from app.infrastructure.db.repositories.disciplina_repository import (
    SQLAlchemyDisciplinaRepository,
)
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.cronograma import (
    ItemCronogramaCreateSchema,
    ItemCronogramaResponseSchema,
)

router = APIRouter(prefix="/api/v1/cronograma", tags=["cronograma"])


@router.get("", response_model=list[ItemCronogramaResponseSchema])
def listar(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ListarCronograma(
        SQLAlchemyCronogramaRepository(db),
        SQLAlchemyDisciplinaRepository(db),
        SQLAlchemyProvaRepository(db),
    )
    return use_case.executar(usuario_id=usuario.id)


@router.post("", response_model=ItemCronogramaResponseSchema, status_code=status.HTTP_201_CREATED)
def criar(
    dados: ItemCronogramaCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    cronograma_repository = SQLAlchemyCronogramaRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)
    prova_repository = SQLAlchemyProvaRepository(db)

    try:
        item = CriarItemCronograma(cronograma_repository, disciplina_repository).executar(
            usuario_id=usuario.id, **dados.model_dump()
        )
    except DisciplinaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    disciplina = disciplina_repository.buscar_por_id(item.disciplina_id)
    prova = prova_repository.buscar_por_id(disciplina.prova_id)
    return ItemCronogramaResponseSchema(
        id=item.id,
        disciplina_id=item.disciplina_id,
        disciplina_nome=disciplina.nome,
        prova_nome=prova.nome,
        dia_semana=item.dia_semana,
        horario_inicio=item.horario_inicio,
        duracao_minutos=item.duracao_minutos,
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    item_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyCronogramaRepository(db)
    try:
        ExcluirItemCronograma(repository).executar(item_id=item_id, usuario_id=usuario.id)
    except ItemCronogramaNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))