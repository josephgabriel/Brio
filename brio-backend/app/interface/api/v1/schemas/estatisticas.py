from datetime import date

from pydantic import BaseModel

from app.application.use_cases.obter_estatisticas import EstatisticasData


class PontoEvolucaoSemanalSchema(BaseModel):
    semana_inicio: date
    horas: float


class EstatisticasResponseSchema(BaseModel):
    total_horas_estudadas: float
    total_sessoes: int
    horas_por_disciplina: dict[str, float]
    evolucao_semanal: list[PontoEvolucaoSemanalSchema]
    taxa_conclusao_revisoes: float
    media_concentracao: float
    media_dificuldade: float
    media_aprendizado: float

    @classmethod
    def from_estatisticas_data(
        cls, dados: EstatisticasData
    ) -> "EstatisticasResponseSchema":
        return cls(
            total_horas_estudadas=dados.total_horas_estudadas,
            total_sessoes=dados.total_sessoes,
            horas_por_disciplina=dados.horas_por_disciplina,
            evolucao_semanal=[
                PontoEvolucaoSemanalSchema(semana_inicio=p.semana_inicio, horas=p.horas)
                for p in dados.evolucao_semanal
            ],
            taxa_conclusao_revisoes=dados.taxa_conclusao_revisoes,
            media_concentracao=dados.media_concentracao,
            media_dificuldade=dados.media_dificuldade,
            media_aprendizado=dados.media_aprendizado,
        )