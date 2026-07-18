from collections import defaultdict
from dataclasses import dataclass
from datetime import date, timedelta

from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import (
    calcular_media,
    calcular_taxa_conclusao,
    gerar_semanas_recentes,
)


@dataclass
class PontoEvolucaoSemanal:
    semana_inicio: date
    horas: float


@dataclass
class EstatisticasData:
    total_horas_estudadas: float
    total_sessoes: int
    horas_por_disciplina: dict[str, float]
    evolucao_semanal: list[PontoEvolucaoSemanal]
    taxa_conclusao_revisoes: float
    media_concentracao: float
    media_dificuldade: float
    media_aprendizado: float


class ObterEstatisticas:
    def __init__(
        self,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
    ) -> None:
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository

    def executar(self, usuario_id: int, prova_id: int | None = None) -> EstatisticasData:
        sessoes = self.sessao_repository.listar_por_usuario(usuario_id, prova_id)
        finalizadas = [
            s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
        ]

        # Horas por disciplina
        minutos_por_disciplina: dict[str, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            minutos_por_disciplina[sessao.disciplina].append(sessao.duracao_minutos)
        horas_por_disciplina = {
            disciplina: calcular_horas_estudadas(minutos)
            for disciplina, minutos in minutos_por_disciplina.items()
        }

        # Evolução semanal (últimas 8 semanas)
        semanas = gerar_semanas_recentes(quantidade=8)
        minutos_por_semana: dict[date, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            data_sessao = sessao.finalizada_em.date()
            inicio_da_semana = data_sessao - timedelta(days=data_sessao.weekday())
            minutos_por_semana[inicio_da_semana].append(sessao.duracao_minutos)

        evolucao_semanal = [
            PontoEvolucaoSemanal(
                semana_inicio=semana,
                horas=calcular_horas_estudadas(minutos_por_semana.get(semana, [])),
            )
            for semana in semanas
        ]

        # Revisões: taxa de conclusão
        revisoes = self.revisao_repository.listar_por_usuario(usuario_id, prova_id)
        total_revisoes = len(revisoes)
        revisoes_concluidas = len([r for r in revisoes if r.concluida_em is not None])
        taxa_conclusao = calcular_taxa_conclusao(total_revisoes, revisoes_concluidas)

        # Médias de autoavaliação
        media_concentracao = calcular_media(
            [s.concentracao for s in finalizadas if s.concentracao is not None]
        )
        media_dificuldade = calcular_media(
            [s.dificuldade for s in finalizadas if s.dificuldade is not None]
        )
        media_aprendizado = calcular_media(
            [s.aprendizado_percentual for s in finalizadas if s.aprendizado_percentual is not None]
        )

        return EstatisticasData(
            total_horas_estudadas=calcular_horas_estudadas(
                [s.duracao_minutos for s in finalizadas]
            ),
            total_sessoes=len(finalizadas),
            horas_por_disciplina=horas_por_disciplina,
            evolucao_semanal=evolucao_semanal,
            taxa_conclusao_revisoes=taxa_conclusao,
            media_concentracao=media_concentracao,
            media_dificuldade=media_dificuldade,
            media_aprendizado=media_aprendizado,
        )