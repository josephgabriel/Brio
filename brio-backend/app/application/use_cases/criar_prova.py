from datetime import date

from app.application.interfaces.prova_repository import ProvaRepository
from app.infrastructure.db.models.prova import (
    PrioridadeProva,
    ProvaModel,
    TipoProva,
)


class CriarProva:
    def __init__(self, repository: ProvaRepository) -> None:
        self.repository = repository

    def executar(
        self,
        *,
        usuario_id: int,
        nome: str,
        tipo: TipoProva,
        horas_disponiveis_dia: float,
        dias_disponiveis_semana: int,
        data_prova: date | None = None,
        instituicao_banca: str | None = None,
        cargo: str | None = None,
        data_divulgacao_edital: date | None = None,
        prioridade: PrioridadeProva = PrioridadeProva.MEDIA,
    ) -> ProvaModel:
        prova = ProvaModel(
            usuario_id=usuario_id,
            nome=nome,
            tipo=tipo,
            instituicao_banca=instituicao_banca,
            cargo=cargo,
            data_prova=data_prova,
            data_divulgacao_edital=data_divulgacao_edital,
            horas_disponiveis_dia=horas_disponiveis_dia,
            dias_disponiveis_semana=dias_disponiveis_semana,
            prioridade=prioridade,
        )
        return self.repository.criar(prova)