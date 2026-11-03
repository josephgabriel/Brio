from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.atualizar_item_cronograma import AtualizarItemCronograma
from app.application.use_cases.criar_item_cronograma import CriarItemCronograma
from app.application.use_cases.definir_conclusao_cronograma import DefinirConclusaoCronograma
from app.application.use_cases.excluir_item_cronograma import ExcluirItemCronograma
from app.application.use_cases.obter_semana_cronograma import ObterSemanaCronograma
from app.domain.exceptions import (
    ConclusaoCronogramaInvalidaError,
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
    AtividadeCronogramaSchema,
    ConclusaoSchema,
    OcorrenciaCronogramaSchema,
)

router = APIRouter(prefix="/api/v1/cronograma", tags=["cronograma"])


@router.get("/semana", response_model=list[OcorrenciaCronogramaSchema])
def semana(
    data: date,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ObterSemanaCronograma(
        SQLAlchemyCronogramaRepository(db),
        SQLAlchemyDisciplinaRepository(db),
        SQLAlchemyProvaRepository(db),
    )
    return use_case.executar(usuario_id=usuario.id, data_referencia=data)


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(
    dados: AtividadeCronogramaSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = CriarItemCronograma(
        SQLAlchemyCronogramaRepository(db), SQLAlchemyDisciplinaRepository(db)
    )
    try:
        item = use_case.executar(usuario_id=usuario.id, **dados.model_dump())
    except DisciplinaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    return {"id": item.id}


@router.put("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def atualizar(
    item_id: int,
    dados: AtividadeCronogramaSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = AtualizarItemCronograma(
        SQLAlchemyCronogramaRepository(db), SQLAlchemyDisciplinaRepository(db)
    )
    try:
        use_case.executar(item_id=item_id, usuario_id=usuario.id, **dados.model_dump())
    except (DisciplinaNaoEncontradaError, ItemCronogramaNaoEncontradoError) as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))


@router.put("/{item_id}/conclusao", status_code=status.HTTP_204_NO_CONTENT)
def definir_conclusao(
    item_id: int,
    dados: ConclusaoSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = DefinirConclusaoCronograma(SQLAlchemyCronogramaRepository(db))
    try:
        use_case.executar(
            item_id=item_id,
            usuario_id=usuario.id,
            data=dados.data,
            concluido=dados.concluido,
        )
    except ItemCronogramaNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except ConclusaoCronogramaInvalidaError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    item_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    try:
        ExcluirItemCronograma(SQLAlchemyCronogramaRepository(db)).executar(
            item_id=item_id, usuario_id=usuario.id
        )
    except ItemCronogramaNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))