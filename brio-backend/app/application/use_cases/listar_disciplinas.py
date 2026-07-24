# app/application/use_cases/listar_disciplinas.py
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.infrastructure.db.models.disciplina import DisciplinaModel


class ListarDisciplinas:
    def __init__(self, repository: DisciplinaRepository) -> None:
        self.repository = repository

    def executar(self, prova_id: int) -> list[DisciplinaModel]:
        return self.repository.listar_por_prova(prova_id)