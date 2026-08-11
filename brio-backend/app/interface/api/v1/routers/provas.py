from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.atualizar_prova import AtualizarProva
from app.application.use_cases.criar_prova import CriarProva
from app.application.use_cases.deletar_prova import DeletarProva
from app.application.use_cases.listar_provas import ListarProvas
from app.application.use_cases.obter_provas import ObterProva
from app.domain.exceptions import ProvaNaoEncontradaError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.prova import (
    ProvaCreateSchema,
    ProvaResponseSchema,
    ProvaUpdateSchema,
)
from app.infrastructure.metricas.registrador_eventos import RegistradorEventos

router = APIRouter(prefix="/api/v1/provas", tags=["provas"])


@router.post("", response_model=ProvaResponseSchema, status_code=status.HTTP_201_CREATED)
def criar(
    dados: ProvaCreateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyProvaRepository(db)
    use_case = CriarProva(repository)
    prova = use_case.executar(usuario_id=usuario.id, **dados.model_dump())
    
    RegistradorEventos(db).registrar("prova_criada", usuario.id)
    return ProvaResponseSchema.from_model(prova)


@router.get("", response_model=list[ProvaResponseSchema])
def listar(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyProvaRepository(db)
    use_case = ListarProvas(repository)
    provas = use_case.executar(usuario_id=usuario.id)
    return [ProvaResponseSchema.from_model(prova) for prova in provas]


@router.get("/{prova_id}", response_model=ProvaResponseSchema)
def obter(
    prova_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyProvaRepository(db)
    use_case = ObterProva(repository)

    try:
        prova = use_case.executar(prova_id=prova_id, usuario_id=usuario.id)
    except ProvaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return ProvaResponseSchema.from_model(prova)


@router.put("/{prova_id}", response_model=ProvaResponseSchema)
def atualizar(
    prova_id: int,
    dados: ProvaUpdateSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyProvaRepository(db)
    use_case = AtualizarProva(repository)

    try:
        prova = use_case.executar(
            prova_id=prova_id, usuario_id=usuario.id, **dados.model_dump()
        )
    except ProvaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return ProvaResponseSchema.from_model(prova)


router.delete("/{prova_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar(
    prova_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyProvaRepository(db)
    use_case = DeletarProva(repository)

    try:
        use_case.executar(prova_id=prova_id, usuario_id=usuario.id)
    except ProvaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except ProvaComDadosVinculadosError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))