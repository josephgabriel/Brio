from datetime import date

from pydantic import BaseModel

from app.application.use_cases.obter_estatisticas import EstatisticasData


class PontoEvolucaoSemanalSchema(BaseModel):
    semana_inicio: date
    horas: float


class PontoEvolucaoMensalSchema(BaseModel):
    mes: date
    horas: float


class EstatisticasResponseSchema(BaseModel):
    total_horas_estudadas: float
    total_sessoes: int
    evolucao_semanal: list[PontoEvolucaoSemanalSchema]
    evolucao_mensal: list[PontoEvolucaoMensalSchema]
    total_conteudos: int
    conteudos_concluidos: int
    cobertura_conteudo: float | None
    taxa_revisoes_em_dia: float | None
    questoes_respondidas: int
    questoes_acertos: int
    taxa_acerto_questoes: float | None

    @classmethod
    def from_estatisticas_data(cls, dados: EstatisticasData) -> "EstatisticasResponseSchema":
        return cls(
            total_horas_estudadas=dados.total_horas_estudadas,
            total_sessoes=dados.total_sessoes,
            evolucao_semanal=[
                PontoEvolucaoSemanalSchema(semana_inicio=p.semana_inicio, horas=p.horas)
                for p in dados.evolucao_semanal
            ],
            evolucao_mensal=[
                PontoEvolucaoMensalSchema(mes=p.mes, horas=p.horas)
                for p in dados.evolucao_mensal
            ],
            total_conteudos=dados.total_conteudos,
            conteudos_concluidos=dados.conteudos_concluidos,
            cobertura_conteudo=dados.cobertura_conteudo,
            taxa_revisoes_em_dia=dados.taxa_revisoes_em_dia,
            questoes_respondidas=dados.questoes_respondidas,
            questoes_acertos=dados.questoes_acertos,
            taxa_acerto_questoes=dados.taxa_acerto_questoes,
        )