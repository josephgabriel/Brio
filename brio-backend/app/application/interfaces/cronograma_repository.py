from abc import ABC, abstractmethod
from datetime import date

from app.infrastructure.db.models.cronograma import CronogramaModel


class CronogramaRepository(ABC):
    @abstractmethod
    def criar(self, item: CronogramaModel) -> CronogramaModel: ...

    @abstractmethod
    def buscar_por_id(self, item_id: int) -> CronogramaModel | None: ...

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[CronogramaModel]: ...

    @abstractmethod
    def atualizar(self, item: CronogramaModel) -> CronogramaModel: ...

    @abstractmethod
    def deletar(self, item: CronogramaModel) -> None: ...

    @abstractmethod
    def listar_conclusoes(
        self, item_ids: list[int], data_inicio: date, data_fim: date
    ) -> set[tuple[int, date]]: ...

    @abstractmethod
    def definir_conclusao(self, item_id: int, data: date, concluido: bool) -> None: ...