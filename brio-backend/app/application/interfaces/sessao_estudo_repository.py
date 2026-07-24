from abc import ABC, abstractmethod

from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel

class SessaoEstudoRepository(ABC):
    @abstractmethod
    def criar(self, sessao: SessaoEstudoModel) -> SessaoEstudoModel: ...

    @abstractmethod
    def buscar_por_id(self, sessao_id: int) -> SessaoEstudoModel | None: ...

    @abstractmethod
    def listar_por_usuario(
        self, usuario_id: int, prova_id: int | None = None
    ) -> list[SessaoEstudoModel]: ...

    @abstractmethod
    def atualizar(self, sessao: SessaoEstudoModel) -> SessaoEstudoModel: ...

    @abstractmethod
    def deletar(self, sessao: SessaoEstudoModel) -> None: ...