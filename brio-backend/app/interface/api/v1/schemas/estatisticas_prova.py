from datetime import date

from pydantic import BaseModel

from app.application.use_cases.obter_estatisticas_prova import EstatisticasProvaData


class PontoEvolucaoSemanalSchema(BaseModel):
    semana_inicio: date
    horas: float

class PontoEvolucaoMensalSchema(BaseModel):
    mes: date
    horas: float


class EstatisticasProvaResponseSchema(BaseModel):
    total_horas_estudadas: float
    total_sessoes: int
    horas_por_disciplina: dict[str, float]
    evolucao_semanal: list[PontoEvolucaoSemanalSchema]
    horas_materias_removidas: float
    taxa_revisoes_em_dia: float | None
    indice_preparacao: int | None
    classificacao_indice: str | None
    motivos: list[str]
    evolucao_mensal: list[PontoEvolucaoMensalSchema]
    cobertura_conteudo: float | None

    @classmethod
    def from_data(cls, dados: EstatisticasProvaData) -> "EstatisticasProvaResponseSchema":
        return cls(
            total_horas_estudadas=dados.total_horas_estudadas,
            total_sessoes=dados.total_sessoes,
            horas_por_disciplina=dados.horas_por_disciplina,
            evolucao_semanal=[
                PontoEvolucaoSemanalSchema(semana_inicio=p.semana_inicio, horas=p.horas)
                for p in dados.evolucao_semanal
            ],
            taxa_revisoes_em_dia=dados.taxa_revisoes_em_dia,
            indice_preparacao=dados.indice_preparacao,
            classificacao_indice=dados.classificacao_indice,
            motivos=dados.motivos,
            evolucao_mensal=[
                PontoEvolucaoMensalSchema(mes=p.mes, horas=p.horas)
                for p in dados.evolucao_mensal
            ],
            cobertura_conteudo=dados.cobertura_conteudo,
            horas_materias_removidas=dados.horas_materias_removidas,
        )