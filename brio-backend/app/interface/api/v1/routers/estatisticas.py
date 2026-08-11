from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.obter_estatisticas import ObterEstatisticas
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.estatisticas import EstatisticasResponseSchema


router = APIRouter(
    prefix="/api/v1/estatisticas",
    tags=["estatisticas"],
)


@router.get(
    "",
    response_model=EstatisticasResponseSchema,
)
def obter(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    revisao_repository = SQLAlchemyRevisaoRepository(db)

    use_case = ObterEstatisticas(
        sessao_repository,
        revisao_repository,
    )

    dados = use_case.executar(
        usuario_id=usuario.id,
    )

    return EstatisticasResponseSchema.from_estatisticas_data(dados)