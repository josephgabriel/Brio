# app/application/use_cases/deletar_disciplina.py
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError


class DeletarDisciplina:
    def __init__(self, repository: DisciplinaRepository) -> None:
        self.repository = repository

    def executar(self, disciplina_id: int, usuario_id: int) -> None:
        disciplina = self.repository.buscar_por_id(disciplina_id)
        if disciplina is None or disciplina.usuario_id != usuario_id:
            raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")
        self.repository.deletar(disciplina)