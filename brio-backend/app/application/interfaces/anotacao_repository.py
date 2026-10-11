from abc import ABC, abstractmethod
from datetime import datetime

from app.infrastructure.db.models.anotacao import AnotacaoModel

class AnotacaoRepository(ABC):
    @abstractmethod
    def buscar_por_topico(self, topico_id: int) -> AnotacaoModel | None:

        ...

    @abstractmethod
    def salvar(self, anotacao: AnotacaoModel) -> AnotacaoModel:

        ...
    
    @abstractmethod

    def criar_versao(self, anotacao_id: int, conteudo_html: str) -> None: ...

    @abstractmethod
    def data_ultima_versao(self, anotacao_id: int) -> datetime | None: ...

    @abstractmethod
    def podar_versoes(self, anotacao_id: int, manter: int) -> None: ...