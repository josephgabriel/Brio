# app/interface/api/v1/routers/topicos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.criar_topico import CriarTopico
from app.application.use_cases.deletar_topico import DeletarTopico
from app.application.use_cases.listar_topico import ListarTopicos
from app.application.use_cases.atualizar_topico import AtualizarTopico

from app.domain.exceptions import DisciplinaNaoEncontradaError, TopicoNaoEncontradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.disciplina_repository import (
    SQLAlchemyDisciplinaRepository,
)
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository
from app.interface.api.v1.schemas.topico import TopicoContextoSchema
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.topico import TopicoCreateSchema, TopicoResponseSchema
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)

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
    topico_repository = SQLAlchemyTopicoRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    use_case = DeletarTopico(topico_repository, disciplina_repository, sessao_repository)

    try:
        use_case.executar(topico_id=topico_id, usuario_id=usuario.id)
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    
@router.put("/api/v1/topicos/{topico_id}", response_model=TopicoResponseSchema)
def atualizar(
    topico_id: int,
    dados: TopicoCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyTopicoRepository(db)
    use_case = AtualizarTopico(repository)
    try:
        return use_case.executar(topico_id=topico_id, usuario_id=usuario.id, nome=dados.nome)
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    
@router.get("/api/v1/topicos/{topico_id}/contexto", response_model=TopicoContextoSchema)
def contexto(
    topico_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    topico_repository = SQLAlchemyTopicoRepository(db)
    topico = topico_repository.buscar_por_id(topico_id)
    if topico is None or topico.usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tópico não encontrado")

    disciplina = SQLAlchemyDisciplinaRepository(db).buscar_por_id(topico.disciplina_id)
    prova = SQLAlchemyProvaRepository(db).buscar_por_id(disciplina.prova_id)

    return TopicoContextoSchema(
        topico_id=topico.id,
        topico_nome=topico.nome,
        disciplina_id=disciplina.id,
        disciplina_nome=disciplina.nome,
        prova_id=prova.id,
        prova_nome=prova.nome,
    )