# app/application/use_cases/criar_item_cronograma.py
from datetime import time

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError
from app.infrastructure.db.models.cronograma import CronogramaModel


class CriarItemCronograma:
    def __init__(
        self,
        cronograma_repository: CronogramaRepository,
        disciplina_repository: DisciplinaRepository,
    ) -> None:
        self.cronograma_repository = cronograma_repository
        self.disciplina_repository = disciplina_repository

    def executar(
        self,
        usuario_id: int,
        disciplina_id: int,
        dia_semana: int,
        duracao_minutos: int,
        horario_inicio: time | None = None,
    ) -> CronogramaModel:
        disciplina = self.disciplina_repository.buscar_por_id(disciplina_id)
        if disciplina is None or disciplina.usuario_id != usuario_id:
            raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")

        item = CronogramaModel(
            usuario_id=usuario_id,
            disciplina_id=disciplina_id,
            dia_semana=dia_semana,
            horario_inicio=horario_inicio,
            duracao_minutos=duracao_minutos,
        )
        return self.cronograma_repository.criar(item)