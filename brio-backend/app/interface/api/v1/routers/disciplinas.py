# app/interface/api/v1/routers/disciplinas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.criar_disciplina import CriarDisciplina
from app.application.use_cases.deletar_disciplina import DeletarDisciplina
from app.application.use_cases.listar_disciplinas import ListarDisciplinas
from app.domain.exceptions import DisciplinaNaoEncontradaError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.disciplina_repository import (
    SQLAlchemyDisciplinaRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.disciplina import (
    DisciplinaCreateSchema,
    DisciplinaResponseSchema,
)

router = APIRouter(tags=["disciplinas"])


@router.post(
    "/api/v1/provas/{prova_id}/disciplinas",
    response_model=DisciplinaResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
def criar(
    prova_id: int,
    dados: DisciplinaCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyDisciplinaRepository(db)
    use_case = CriarDisciplina(repository)
    disciplina = use_case.executar(usuario_id=usuario.id, prova_id=prova_id, nome=dados.nome)
    return disciplina


@router.get(
    "/api/v1/provas/{prova_id}/disciplinas", response_model=list[DisciplinaResponseSchema]
)
def listar(
    prova_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyDisciplinaRepository(db)
    use_case = ListarDisciplinas(repository)
    return use_case.executar(prova_id=prova_id)


@router.delete("/api/v1/disciplinas/{disciplina_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    disciplina_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyDisciplinaRepository(db)
    use_case = DeletarDisciplina(repository)
    try:
        use_case.executar(disciplina_id=disciplina_id, usuario_id=usuario.id)
    except DisciplinaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))