from abc import ABC, abstractmethod

from app.infrastructure.db.models.topico import TopicoModel


class TopicoRepository(ABC):
    @abstractmethod
    def criar(self, topico: TopicoModel) -> TopicoModel: ...

    @abstractmethod
    def buscar_por_id(self, topico_id: int) -> TopicoModel | None: ...

    @abstractmethod
    def listar_por_disciplina(self, disciplina_id: int) -> list[TopicoModel]: ...

    @abstractmethod
    def deletar(self, topico: TopicoModel) -> None: ...