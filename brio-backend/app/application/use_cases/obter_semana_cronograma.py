from dataclasses import dataclass
from datetime import date, time

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.prova_repository import ProvaRepository
from app.domain.regras.cronograma import datas_da_semana, ocorre_em
from app.domain.regras.tempo import data_local
from app.infrastructure.db.models.prova import StatusProva


@dataclass
class OcorrenciaCronograma:
    item_id: int
    data: date
    titulo: str
    titulo_personalizado: str | None
    foco: str | None
    tipo: str
    disciplina_id: int | None
    disciplina_nome: str | None
    prova_id: int | None
    prova_nome: str | None
    dia_semana: int
    horario_inicio: time | None
    duracao_minutos: int
    concluido: bool


class ObterSemanaCronograma:
    def __init__(
        self,
        cronograma_repository: CronogramaRepository,
        disciplina_repository: DisciplinaRepository,
        prova_repository: ProvaRepository,
    ) -> None:
        self.cronograma_repository = cronograma_repository
        self.disciplina_repository = disciplina_repository
        self.prova_repository = prova_repository

    def executar(self, usuario_id: int, data_referencia: date) -> list[OcorrenciaCronograma]:
        datas = datas_da_semana(data_referencia)
        itens = self.cronograma_repository.listar_por_usuario(usuario_id)
        concluidas = self.cronograma_repository.listar_conclusoes(
            [item.id for item in itens], datas[0], datas[-1]
        )

        cache_disciplinas: dict[int, object] = {}
        cache_provas: dict[int, object] = {}
        ocorrencias: list[OcorrenciaCronograma] = []

        for item in itens:
            disciplina = None
            prova = None

            if item.disciplina_id is not None:
                if item.disciplina_id not in cache_disciplinas:
                    cache_disciplinas[item.disciplina_id] = self.disciplina_repository.buscar_por_id(
                        item.disciplina_id
                    )
                disciplina = cache_disciplinas[item.disciplina_id]

                if disciplina is not None:
                    if disciplina.prova_id not in cache_provas:
                        cache_provas[disciplina.prova_id] = self.prova_repository.buscar_por_id(
                            disciplina.prova_id
                        )
                    prova = cache_provas[disciplina.prova_id]

            # Atividades de provas arquivadas ou concluídas saem do planejamento
            if prova is not None and prova.status != StatusProva.ATIVA:
                continue

            titulo = item.titulo or (disciplina.nome if disciplina else "Atividade")
            criada_em = data_local(item.criado_em)

            for data in datas:
                if not ocorre_em(item.dia_semana, criada_em, data):
                    continue
                ocorrencias.append(
                    OcorrenciaCronograma(
                        item_id=item.id,
                        data=data,
                        titulo=titulo,
                        titulo_personalizado=item.titulo,
                        foco=item.foco,
                        tipo=item.tipo,
                        disciplina_id=item.disciplina_id,
                        disciplina_nome=disciplina.nome if disciplina else None,
                        prova_id=prova.id if prova else None,
                        prova_nome=prova.nome if prova else None,
                        dia_semana=item.dia_semana,
                        horario_inicio=item.horario_inicio,
                        duracao_minutos=item.duracao_minutos,
                        concluido=(item.id, data) in concluidas,
                    )
                )

        ocorrencias.sort(
            key=lambda o: (o.data, o.horario_inicio is None, o.horario_inicio or time.min, o.item_id)
        )
        return ocorrencias