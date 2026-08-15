# app/application/interfaces/cronograma_repository.py
from abc import ABC, abstractmethod

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