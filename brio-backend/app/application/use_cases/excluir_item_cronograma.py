# app/application/use_cases/excluir_item_cronograma.py
from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.domain.exceptions import ItemCronogramaNaoEncontradoError


class ExcluirItemCronograma:
    def __init__(self, repository: CronogramaRepository) -> None:
        self.repository = repository

    def executar(self, item_id: int, usuario_id: int) -> None:
        item = self.repository.buscar_por_id(item_id)
        if item is None or item.usuario_id != usuario_id:
            raise ItemCronogramaNaoEncontradoError(f"Item {item_id} não encontrado")
        self.repository.deletar(item)