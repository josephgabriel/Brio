from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, timedelta

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_provas import ObterProva
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import (
    calcular_media,
    calcular_taxa_conclusao,
    gerar_semanas_recentes,
)
from app.domain.regras.indice_preparacao import calcular_indice_preparacao, classificar_indice


@dataclass
class PontoEvolucaoSemanal:
    semana_inicio: date
    horas: float


@dataclass
class EstatisticasProvaData:
    total_horas_estudadas: float
    total_sessoes: int
    horas_por_disciplina: dict[str, float]
    evolucao_semanal: list[PontoEvolucaoSemanal]
    taxa_conclusao_revisoes: float
    media_concentracao: float
    media_dificuldade: float
    media_aprendizado: float
    nivel_medio_conhecimento: float | None
    indice_preparacao: int | None
    classificacao_indice: str | None
    motivos: list[str] = field(default_factory=list)


class ObterEstatisticasProva:
    def __init__(
        self,
        prova_repository: ProvaRepository,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
        disciplina_repository: DisciplinaRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.disciplina_repository = disciplina_repository
        self.obter_prova = ObterProva(prova_repository)

    def executar(self, prova_id: int, usuario_id: int) -> EstatisticasProvaData:
        prova = self.obter_prova.executar(prova_id, usuario_id)
        hoje = date.today()

        sessoes = self.sessao_repository.listar_por_usuario(usuario_id, prova_id)
        finalizadas = [
            s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
        ]

        minutos_por_disciplina: dict[str, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            minutos_por_disciplina[sessao.disciplina].append(sessao.duracao_minutos)
        horas_por_disciplina = {
            disciplina: calcular_horas_estudadas(minutos)
            for disciplina, minutos in minutos_por_disciplina.items()
        }

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

        revisoes = self.revisao_repository.listar_por_usuario(usuario_id, prova_id)
        total_revisoes = len(revisoes)
        revisoes_concluidas = len([r for r in revisoes if r.concluida_em is not None])
        taxa_conclusao = calcular_taxa_conclusao(total_revisoes, revisoes_concluidas)

        media_concentracao = calcular_media(
            [s.concentracao for s in finalizadas if s.concentracao is not None]
        )
        media_dificuldade = calcular_media(
            [s.dificuldade for s in finalizadas if s.dificuldade is not None]
        )
        media_aprendizado = calcular_media(
            [s.aprendizado_percentual for s in finalizadas if s.aprendizado_percentual is not None]
        )

        disciplinas = self.disciplina_repository.listar_por_prova(prova_id)
        nivel_medio = (
            calcular_media([d.nivel_conhecimento for d in disciplinas]) if disciplinas else None
        )

        indice = None
        classificacao = None
        motivos: list[str] = []

        if nivel_medio is not None:
            inicio_semana_atual = hoje - timedelta(days=hoje.weekday())
            horas_semana_atual = calcular_horas_estudadas(
                minutos_por_semana.get(inicio_semana_atual, [])
            )
            meta_horas_semana = prova.horas_disponiveis_dia * prova.dias_disponiveis_semana

            indice = calcular_indice_preparacao(
                nivel_medio, taxa_conclusao, horas_semana_atual, meta_horas_semana
            )
            classificacao = classificar_indice(indice)

            if nivel_medio < 50:
                motivos.append(
                    f"O nível médio de conhecimento das matérias está em {round(nivel_medio)}%."
                )
            if taxa_conclusao < 50:
                motivos.append("Menos da metade das revisões agendadas foram concluídas.")
            if meta_horas_semana > 0 and horas_semana_atual < meta_horas_semana * 0.7:
                motivos.append(
                    "Você estudou menos horas do que sua meta semanal para esta prova."
                )
            if not motivos:
                motivos.append("Seu ritmo está alinhado com a meta definida para esta prova.")

        return EstatisticasProvaData(
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
            nivel_medio_conhecimento=nivel_medio,
            indice_preparacao=indice,
            classificacao_indice=classificacao,
            motivos=motivos,
        )