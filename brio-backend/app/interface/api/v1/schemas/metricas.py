from pydantic import BaseModel

from app.application.use_cases.obter_resumo_metricas import ResumoMetricas

class ResumoMetricasSchema(BaseModel):
    total_usuarios: int
    usuarios_ativos_hoje: int
    usuarios_ativos_semana: int
    total_provas_criadas: int
    total_sessoes_iniciadas: int
    total_sessoes_finalizadas: int
    taxa_conclusao_sessoes: float

    @classmethod
    def from_resumo(cls, resumo: ResumoMetricas) -> "ResumoMetricasSchema":
        return cls(**resumo.__dict__)