from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.obter_resumo_metricas import ObterResumoMetricas
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_admin
from app.interface.api.v1.schemas.metricas import ResumoMetricasSchema

router = APIRouter(prefix="/api/v1/metricas", tags=["metricas"])


@router.get("/resumo", response_model=ResumoMetricasSchema)
def resumo(
    _usuario: UsuarioModel = Depends(get_usuario_admin),
    db: Session = Depends(get_db),
):
    use_case = ObterResumoMetricas(db)
    return ResumoMetricasSchema.from_resumo(use_case.executar())