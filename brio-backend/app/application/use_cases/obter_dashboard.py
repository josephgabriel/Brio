from dataclasses import dataclass
from datetime import date, timedelta

from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.regras.dashboard import(
    calcular_horas_estudadas,
    calcular_sequencia_dias_estudando,
)
from app.infrastructure.db.models.prova import ProvaModel, StatusProva

@dataclass
class DashboardData:
    horas_hoje: float
    horas_semana: float
    horas_mes: float
    sequencia_dias: int
    revisoes_pendentes_hoje: int
    provas_ativas: int
    provas: list[ProvaModel]

class ObterDashboard:
    def __init__(
            self,
            prova_repository: ProvaRepository,
            sessao_repository: SessaoEstudoRepository,
            revisao_repository: RevisaoRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository

    def executar(self, usuario_id: int) -> DashboardData:
        hoje = date.today()

        sessoes = self.sessao_repository.listar_por_usuario(usuario_id)
        finalizadas = [
            s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
        ]

        duracoes_hoje = [
            s.duracao_minutos for s in finalizadas if s.finalizada_em.date() == hoje
        ]

        duracoes_semana = [
            s.duracao_minutos
            for s in finalizadas
            if s.finalizada_em.date() >= hoje - timedelta(days=6)
        ]
        
        duracoes_mes = [
            s.duracao_minutos
            for s in finalizadas
            if s.finalizada_em.date() >= hoje - timedelta(days=29)
        ]

        datas_estudadas = {s.finalizada_em.date() for s in finalizadas}

        revisoes_hoje = self.revisao_repository.listar_ate_data(usuario_id, hoje)

        provas = self.prova_repository.listar_por_usuario(usuario_id)
        provas_ativas = [p for p in provas if p.status == StatusProva.ATIVA]

        return DashboardData(
            horas_hoje=calcular_horas_estudadas(duracoes_hoje),
            horas_semana=calcular_horas_estudadas(duracoes_semana),
            horas_mes=calcular_horas_estudadas(duracoes_mes),
            sequencia_dias=calcular_sequencia_dias_estudando(datas_estudadas, hoje),
            revisoes_pendentes_hoje=len(revisoes_hoje),
            provas_ativas=len(provas_ativas),
            provas=provas_ativas,
        )
