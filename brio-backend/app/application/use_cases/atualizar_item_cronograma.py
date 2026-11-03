from datetime import time

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError, ItemCronogramaNaoEncontradoError
from app.infrastructure.db.models.cronograma import CronogramaModel


class AtualizarItemCronograma:
    def __init__(
        self,
        cronograma_repository: CronogramaRepository,
        disciplina_repository: DisciplinaRepository,
    ) -> None:
        self.cronograma_repository = cronograma_repository
        self.disciplina_repository = disciplina_repository

    def executar(
        self,
        *,
        item_id: int,
        usuario_id: int,
        tipo: str,
        dia_semana: int,
        duracao_minutos: int,
        disciplina_id: int | None = None,
        titulo: str | None = None,
        foco: str | None = None,
        horario_inicio: time | None = None,
    ) -> CronogramaModel:
        item = self.cronograma_repository.buscar_por_id(item_id)
        if item is None or item.usuario_id != usuario_id:
            raise ItemCronogramaNaoEncontradoError(f"Item {item_id} não encontrado")

        if disciplina_id is not None:
            disciplina = self.disciplina_repository.buscar_por_id(disciplina_id)
            if disciplina is None or disciplina.usuario_id != usuario_id:
                raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")

        item.disciplina_id = disciplina_id
        item.titulo = titulo
        item.foco = foco
        item.tipo = tipo
        item.dia_semana = dia_semana
        item.horario_inicio = horario_inicio
        item.duracao_minutos = duracao_minutos
        return self.cronograma_repository.atualizar(item)