from abc import ABC, abstractmethod
from datetime import date

from app.infrastructure.db.models.revisao import RevisaoModel


class RevisaoRepository(ABC):
    @abstractmethod
    def criar_varias(self, revisoes: list[RevisaoModel]) -> list[RevisaoModel]: ...

    @abstractmethod
    def buscar_por_id(self, revisao_id: int) -> RevisaoModel | None: ...

    @abstractmethod
    def listar_por_usuario(
        self,
        usuario_id: int,
        prova_id: int | None = None,
        apenas_pendentes: bool = False,
    ) -> list[RevisaoModel]: ...

    @abstractmethod
    def listar_ate_data(self, usuario_id: int, data_limite: date) -> list[RevisaoModel]: ...

    @abstractmethod
    def atualizar(self, revisao: RevisaoModel) -> RevisaoModel: ...