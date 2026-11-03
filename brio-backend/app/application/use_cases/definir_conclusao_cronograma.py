from datetime import date

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.domain.exceptions import (
    ConclusaoCronogramaInvalidaError,
    ItemCronogramaNaoEncontradoError,
)
from app.domain.regras.cronograma import ocorre_em
from app.domain.regras.tempo import data_local, hoje_local


class DefinirConclusaoCronograma:
    def __init__(self, repository: CronogramaRepository) -> None:
        self.repository = repository

    def executar(self, item_id: int, usuario_id: int, data: date, concluido: bool) -> None:
        item = self.repository.buscar_por_id(item_id)
        if item is None or item.usuario_id != usuario_id:
            raise ItemCronogramaNaoEncontradoError(f"Item {item_id} não encontrado")

        if not ocorre_em(item.dia_semana, data_local(item.criado_em), data):
            raise ConclusaoCronogramaInvalidaError("Esta atividade não acontece nesse dia")
        if data > hoje_local():
            raise ConclusaoCronogramaInvalidaError(
                "Só é possível concluir atividades de hoje ou de dias anteriores"
            )

        self.repository.definir_conclusao(item_id, data, concluido)