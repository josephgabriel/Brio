from collections import defaultdict
from dataclasses import dataclass
from datetime import date, timedelta

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.ia_repository import HistoricoRespostaRepository
from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import (
    calcular_taxa_conclusao,
    calcular_taxa_revisoes_em_dia,
    gerar_meses_recentes,
    gerar_semanas_recentes,
)
from app.domain.regras.progresso import calcular_cobertura_conteudo
from app.infrastructure.db.models.prova import StatusProva


@dataclass
class PontoEvolucaoSemanal:
    semana_inicio: date
    horas: float


@dataclass
class PontoEvolucaoMensal:
    mes: date
    horas: float


@dataclass
class EstatisticasData:
    total_horas_estudadas: float
    total_sessoes: int
    evolucao_semanal: list[PontoEvolucaoSemanal]
    evolucao_mensal: list[PontoEvolucaoMensal]
    total_conteudos: int
    conteudos_concluidos: int
    cobertura_conteudo: float | None
    taxa_revisoes_em_dia: float | None
    questoes_respondidas: int
    questoes_acertos: int
    taxa_acerto_questoes: float | None


class ObterEstatisticas:
    def __init__(
        self,
        prova_repository: ProvaRepository,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
        disciplina_repository: DisciplinaRepository,
        topico_repository: TopicoRepository,
        historico_repository: HistoricoRespostaRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.disciplina_repository = disciplina_repository
        self.topico_repository = topico_repository
        self.historico_repository = historico_repository

    def executar(self, usuario_id: int) -> EstatisticasData:
        hoje = date.today()

        # --- Histórico de estudo: todas as provas ---
        sessoes = self.sessao_repository.listar_por_usuario(usuario_id)
        finalizadas = [
            s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
        ]

        minutos_por_semana: dict[date, list[int]] = defaultdict(list)
        minutos_por_mes: dict[date, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            dia = sessao.finalizada_em.date()
            minutos_por_semana[dia - timedelta(days=dia.weekday())].append(sessao.duracao_minutos)
            minutos_por_mes[dia.replace(day=1)].append(sessao.duracao_minutos)

        evolucao_semanal = [
            PontoEvolucaoSemanal(
                semana_inicio=semana,
                horas=calcular_horas_estudadas(minutos_por_semana.get(semana, [])),
            )
            for semana in gerar_semanas_recentes(quantidade=8)
        ]
        evolucao_mensal = [
            PontoEvolucaoMensal(
                mes=mes, horas=calcular_horas_estudadas(minutos_por_mes.get(mes, []))
            )
            for mes in gerar_meses_recentes(quantidade=6)
        ]

        # --- Situação atual: só provas ativas ---
        provas_ativas = [
            p
            for p in self.prova_repository.listar_por_usuario(usuario_id)
            if p.status == StatusProva.ATIVA
        ]
        ids_ativas = {p.id for p in provas_ativas}

        contagens: dict[int, tuple[int, int]] = {}
        for prova in provas_ativas:
            disciplinas = self.disciplina_repository.listar_por_prova(prova.id)
            contagens.update(
                self.topico_repository.contar_por_disciplinas([d.id for d in disciplinas])
            )
        total_conteudos = sum(total for total, _ in contagens.values())
        conteudos_concluidos = sum(concluidos for _, concluidos in contagens.values())

        revisoes = [
            r
            for r in self.revisao_repository.listar_por_usuario(usuario_id)
            if r.prova_id in ids_ativas
        ]
        taxa_revisoes = calcular_taxa_revisoes_em_dia(
            [(r.data_agendada, r.concluida_em is not None) for r in revisoes], hoje
        )

        # --- Questões respondidas ---
        respondidas, acertos = self.historico_repository.contar_por_usuario(usuario_id)
        taxa_acerto = calcular_taxa_conclusao(respondidas, acertos) if respondidas else None

        return EstatisticasData(
            total_horas_estudadas=calcular_horas_estudadas(
                [s.duracao_minutos for s in finalizadas]
            ),
            total_sessoes=len(finalizadas),
            evolucao_semanal=evolucao_semanal,
            evolucao_mensal=evolucao_mensal,
            total_conteudos=total_conteudos,
            conteudos_concluidos=conteudos_concluidos,
            cobertura_conteudo=calcular_cobertura_conteudo(contagens),
            taxa_revisoes_em_dia=taxa_revisoes,
            questoes_respondidas=respondidas,
            questoes_acertos=acertos,
            taxa_acerto_questoes=taxa_acerto,
        )