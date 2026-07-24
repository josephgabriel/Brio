# app/application/use_cases/listar_topicos.py
from app.application.interfaces.topico_repository import TopicoRepository
from app.infrastructure.db.models.topico import TopicoModel


class ListarTopicos:
    def __init__(self, repository: TopicoRepository) -> None:
        self.repository = repository

    def executar(self, disciplina_id: int) -> list[TopicoModel]:
        return self.repository.listar_por_disciplina(disciplina_id)