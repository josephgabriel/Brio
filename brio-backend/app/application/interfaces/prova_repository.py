from abc import ABC, abstractmethod

from app.infrastructure.db.models.prova import ProvaModel

class ProvaRepository(ABC):
    @abstractmethod
    def criar(self, prova: ProvaModel) -> ProvaModel: ...

    @abstractmethod
    def listar_por_usuario(self, usuario_id: int) -> list[ProvaModel]: ...

    @abstractmethod
    def buscar_por_id(self, prova_id: int) -> ProvaModel | None: ...

    @abstractmethod
    def atualizar(self, prova: ProvaModel) -> ProvaModel: ...

    @abstractmethod
    def deletar(self, prova: ProvaModel) -> None: ...