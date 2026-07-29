from abc import ABC, abstractmethod

from app.infrastructure.db.models.anotacao import AnotacaoModel

class AnotacaoRepository(ABC):
    @abstractmethod
    def buscar_por_topico(self, topico_id: int) -> AnotacaoModel | None:

        ...

    @abstractmethod
    def salvar(self, anotacao: AnotacaoModel) -> AnotacaoModel:

        ...