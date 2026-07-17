from datetime import date

from app.application.interfaces.prova_repository import ProvaRepository
from app.application.use_cases.obter_provas import ObterProva
from app.infrastructure.db.models.prova import (
    PrioridadeProva,
    ProvaModel,
    StatusProva,
    TipoProva,
)


class AtualizarProva:
    def __init__(self, repository: ProvaRepository) -> None:
        self.repository = repository
        self.obter_prova = ObterProva(repository)

    def executar(
        self,
        prova_id: int,
        usuario_id: int,
        nome: str | None = None,
        tipo: TipoProva | None = None,
        instituicao_banca: str | None = None,
        cargo: str | None = None,
        data_prova: date | None = None,
        data_divulgacao_edital: date | None = None,
        horas_disponiveis_dia: float | None = None,
        dias_disponiveis_semana: int | None = None,
        prioridade: PrioridadeProva | None = None,
        status: StatusProva | None = None,
    ) -> ProvaModel:
        prova = self.obter_prova.executar(prova_id, usuario_id)

        if nome is not None:
            prova.nome = nome
        if tipo is not None:
            prova.tipo = tipo
        if instituicao_banca is not None:
            prova.instituicao_banca = instituicao_banca
        if cargo is not None:
            prova.cargo = cargo
        if data_prova is not None:
            prova.data_prova = data_prova
        if data_divulgacao_edital is not None:
            prova.data_divulgacao_edital = data_divulgacao_edital
        if horas_disponiveis_dia is not None:
            prova.horas_disponiveis_dia = horas_disponiveis_dia
        if dias_disponiveis_semana is not None:
            prova.dias_disponiveis_semana = dias_disponiveis_semana
        if prioridade is not None:
            prova.prioridade = prioridade
        if status is not None:
            prova.status = status

        return self.repository.atualizar(prova)