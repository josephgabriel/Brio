from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.obter_dashboard import ObterDashboard
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.dashboard import DashboardResponseSchema

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponseSchema)
def obter(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    prova_repository = SQLAlchemyProvaRepository(db)
    sessao_repository = SQLAlchemySessaoEstudoRepository(db)
    revisao_repository = SQLAlchemyRevisaoRepository(db)

    use_case = ObterDashboard(prova_repository, sessao_repository, revisao_repository)
    dados = use_case.executar(usuario_id=usuario.id)

    return DashboardResponseSchema.from_dashboard_data(dados)