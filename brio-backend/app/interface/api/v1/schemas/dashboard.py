from pydantic import BaseModel
from app.application.use_cases.obter_dashboard import DashboardData
from app.interface.api.v1.schemas.prova import ProvaResponseSchema

class DashboardResponseSchema(BaseModel):
    horas_hoje: float
    horas_semana: float
    horas_mes: float
    sequencia_dias: int
    revisoes_pendentes_hoje: int
    provas_ativas: int
    provas: list[ProvaResponseSchema]

    @classmethod
    def from_dashboard_data(cls, dados: DashboardData) -> "DashboardResponseSchema":
        return cls(
            horas_hoje = dados.horas_hoje,
            horas_semana = dados.horas_semana,
            horas_mes = dados.horas_mes,
            sequencia_dias = dados.sequencia_dias,
            revisoes_pendentes_hoje = dados.revisoes_pendentes_hoje,
            provas_ativas = dados.provas_ativas,
            provas = [ProvaResponseSchema.from_model(prova) for prova in dados.provas],
        )