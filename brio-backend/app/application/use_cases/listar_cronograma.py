# app/application/use_cases/listar_cronograma.py
from dataclasses import dataclass
from datetime import time

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.prova_repository import ProvaRepository


@dataclass
class ItemCronograma:
    id: int
    disciplina_id: int
    disciplina_nome: str
    prova_nome: str
    dia_semana: int
    horario_inicio: time | None
    duracao_minutos: int


class ListarCronograma:
    def __init__(
        self,
        cronograma_repository: CronogramaRepository,
        disciplina_repository: DisciplinaRepository,
        prova_repository: ProvaRepository,
    ) -> None:
        self.cronograma_repository = cronograma_repository
        self.disciplina_repository = disciplina_repository
        self.prova_repository = prova_repository

    def executar(self, usuario_id: int) -> list[ItemCronograma]:
        itens = self.cronograma_repository.listar_por_usuario(usuario_id)

        cache_disciplinas: dict[int, object] = {}
        cache_provas: dict[int, object] = {}
        resultado: list[ItemCronograma] = []

        for item in itens:
            if item.disciplina_id not in cache_disciplinas:
                cache_disciplinas[item.disciplina_id] = self.disciplina_repository.buscar_por_id(
                    item.disciplina_id
                )
            disciplina = cache_disciplinas[item.disciplina_id]

            if disciplina.prova_id not in cache_provas:
                cache_provas[disciplina.prova_id] = self.prova_repository.buscar_por_id(
                    disciplina.prova_id
                )
            prova = cache_provas[disciplina.prova_id]

            resultado.append(
                ItemCronograma(
                    id=item.id,
                    disciplina_id=item.disciplina_id,
                    disciplina_nome=disciplina.nome,
                    prova_nome=prova.nome,
                    dia_semana=item.dia_semana,
                    horario_inicio=item.horario_inicio,
                    duracao_minutos=item.duracao_minutos,
                )
            )

        return resultado