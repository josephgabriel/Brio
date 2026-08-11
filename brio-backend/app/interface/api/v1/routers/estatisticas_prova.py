from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.obter_estatisticas_prova import ObterEstatisticasProva
from app.domain.exceptions import ProvaNaoEncontradaError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.disciplina_repository import (
    SQLAlchemyDisciplinaRepository,
)
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.estatisticas_prova import EstatisticasProvaResponseSchema

router = APIRouter(tags=["estatisticas"])


@router.get(
    "/api/v1/provas/{prova_id}/estatisticas", response_model=EstatisticasProvaResponseSchema
)
def obter(
    prova_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    prova_repository = SQLAlchemyProvaRepository(db)
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    revisao_repository = SQLAlchemyRevisaoRepository(db)
    disciplina_repository = SQLAlchemyDisciplinaRepository(db)

    use_case = ObterEstatisticasProva(
        prova_repository, sessao_repository, revisao_repository, disciplina_repository
    )

    try:
        dados = use_case.executar(prova_id=prova_id, usuario_id=usuario.id)
    except ProvaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return EstatisticasProvaResponseSchema.from_data(dados)