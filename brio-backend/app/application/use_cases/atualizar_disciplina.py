from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError
from app.infrastructure.db.models.disciplina import DisciplinaModel


class AtualizarDisciplina:
    def __init__(self, repository: DisciplinaRepository) -> None:
        self.repository = repository

    def executar(self, disciplina_id: int, usuario_id: int, nome: str) -> DisciplinaModel:
        disciplina = self.repository.buscar_por_id(disciplina_id)
        if disciplina is None or disciplina.usuario_id != usuario_id:
            raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")
        disciplina.nome = nome
        return self.repository.atualizar(disciplina)