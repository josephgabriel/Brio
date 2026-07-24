# app/application/use_cases/criar_disciplina.py
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.infrastructure.db.models.disciplina import DisciplinaModel


class CriarDisciplina:
    def __init__(self, repository: DisciplinaRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int, prova_id: int, nome: str) -> DisciplinaModel:
        disciplina = DisciplinaModel(usuario_id=usuario_id, prova_id=prova_id, nome=nome)
        return self.repository.criar(disciplina)