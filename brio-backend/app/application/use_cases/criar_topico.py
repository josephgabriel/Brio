# app/application/use_cases/criar_topico.py
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError
from app.infrastructure.db.models.topico import TopicoModel


class CriarTopico:
    def __init__(
        self, topico_repository: TopicoRepository, disciplina_repository: DisciplinaRepository
    ) -> None:
        self.topico_repository = topico_repository
        self.disciplina_repository = disciplina_repository

    def executar(self, usuario_id: int, disciplina_id: int, nome: str) -> TopicoModel:
        disciplina = self.disciplina_repository.buscar_por_id(disciplina_id)
        if disciplina is None or disciplina.usuario_id != usuario_id:
            raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")

        topico = TopicoModel(usuario_id=usuario_id, disciplina_id=disciplina_id, nome=nome)
        return self.topico_repository.criar(topico)