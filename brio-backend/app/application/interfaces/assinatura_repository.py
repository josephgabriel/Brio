from abc import ABC, abstractmethod

from app.infrastructure.db.models.assinatura import AssinaturaModel


class AssinaturaRepository(ABC):
    @abstractmethod
    def criar(self, assinatura: AssinaturaModel) -> AssinaturaModel: ...

    @abstractmethod
    def buscar_por_usuario(self, usuario_id: int) -> AssinaturaModel | None: ...

    @abstractmethod
    def buscar_por_preapproval_id(self, preapproval_id: str) -> AssinaturaModel | None: ...

    @abstractmethod
    def atualizar(self, assinatura: AssinaturaModel) -> AssinaturaModel: ...