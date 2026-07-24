from abc import ABC, abstractmethod

from app.infrastructure.db.models.disciplina import DisciplinaModel


class DisciplinaRepository(ABC):
    @abstractmethod
    def criar(self, disciplina: DisciplinaModel) -> DisciplinaModel: ...

    @abstractmethod
    def buscar_por_id(self, disciplina_id: int) -> DisciplinaModel | None: ...

    @abstractmethod
    def listar_por_prova(self, prova_id: int) -> list[DisciplinaModel]: ...

    @abstractmethod
    def atualizar(self, disciplina: DisciplinaModel) -> DisciplinaModel: ...

    @abstractmethod
    def deletar(self, disciplina: DisciplinaModel) -> None: ...