from abc import ABC, abstractmethod
from datetime import date

from app.infrastructure.db.models.resumo_ia import ResumoIAModel

class ResumoIARepository(ABC):
    @abstractmethod
    def criar(self, resumo: ResumoIAModel) -> ResumoIAModel: ...

    @abstractmethod
    def buscar_por_id(self, resumo_id: int) -> ResumoIAModel | None: ...

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[ResumoIAModel]: ...

    @abstractmethod
    def contar_no_mes(self, usuario_id: int, inicio_do_mes: date) -> int: ...

    @abstractmethod
    def atualizar(self, resumo: ResumoIAModel) -> ResumoIAModel: ...