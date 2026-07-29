from dataclasses import dataclass
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.infrastructure.db.models.evento_metrica import EventoMetricaModel
from app.infrastructure.db.models.prova import ProvaModel
from app.infrastructure.db.models.usuario import UsuarioModel


@dataclass
class ResumoMetricas:
    total_usuarios: int
    usuarios_ativos_hoje: int
    usuarios_ativos_semana: int
    total_provas_criadas: int
    total_sessoes_iniciadas: int
    total_sessoes_finalizadas: int
    taxa_conclusao_sessoes: float


class ObterResumoMetricas:
    def __init__(self, db: Session) -> None:
        self.db = db

    def executar(self) -> ResumoMetricas:
        hoje = date.today()
        inicio_semana = hoje - timedelta(days=7)

        total_usuarios = self.db.query(UsuarioModel).count()

        usuarios_ativos_hoje = (
            self.db.query(func.count(func.distinct(EventoMetricaModel.usuario_id)))
            .filter(func.date(EventoMetricaModel.criado_em) == hoje)
            .scalar()
        ) or 0

        usuarios_ativos_semana = (
            self.db.query(func.count(func.distinct(EventoMetricaModel.usuario_id)))
            .filter(EventoMetricaModel.criado_em >= inicio_semana)
            .scalar()
        ) or 0

        total_provas = self.db.query(ProvaModel).count()

        total_iniciadas = (
            self.db.query(EventoMetricaModel)
            .filter(EventoMetricaModel.tipo_evento == "sessao_iniciada")
            .count()
        )
        total_finalizadas = (
            self.db.query(EventoMetricaModel)
            .filter(EventoMetricaModel.tipo_evento == "sessao_finalizada")
            .count()
        )

        taxa_conclusao = (
            round((total_finalizadas / total_iniciadas) * 100, 1) if total_iniciadas > 0 else 0.0
        )

        return ResumoMetricas(
            total_usuarios=total_usuarios,
            usuarios_ativos_hoje=usuarios_ativos_hoje,
            usuarios_ativos_semana=usuarios_ativos_semana,
            total_provas_criadas=total_provas,
            total_sessoes_iniciadas=total_iniciadas,
            total_sessoes_finalizadas=total_finalizadas,
            taxa_conclusao_sessoes=taxa_conclusao,
        )