from dataclasses import dataclass
from datetime import date, timedelta

from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import calcular_taxa_conclusao
from app.domain.regras.indice_preparacao import calcular_indice_preparacao, classificar_indice
from app.infrastructure.db.models.prova import StatusProva


@dataclass
class ResumoComparacaoProva:
    prova_id: int
    nome: str
    total_horas_estudadas: float
    total_sessoes: int
    taxa_conclusao_revisoes: float
    indice_preparacao: int
    classificacao_indice: str


class ObterComparacaoProvas:
    def __init__(
        self,
        prova_repository: ProvaRepository,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository

    def executar(self, usuario_id: int) -> list[ResumoComparacaoProva]:
        hoje = date.today()
        inicio_semana_atual = hoje - timedelta(days=hoje.weekday())

        provas_ativas = [
            p
            for p in self.prova_repository.listar_por_usuario(usuario_id)
            if p.status == StatusProva.ATIVA
        ]

        resultado: list[ResumoComparacaoProva] = []
        for prova in provas_ativas:
            sessoes = self.sessao_repository.listar_por_usuario(usuario_id, prova.id)
            finalizadas = [
                s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
            ]

            total_horas = calcular_horas_estudadas([s.duracao_minutos for s in finalizadas])
            horas_semana_atual = calcular_horas_estudadas(
                [
                    s.duracao_minutos
                    for s in finalizadas
                    if s.finalizada_em.date() >= inicio_semana_atual
                ]
            )

            revisoes = self.revisao_repository.listar_por_usuario(usuario_id, prova.id)
            taxa_conclusao = calcular_taxa_conclusao(
                len(revisoes), len([r for r in revisoes if r.concluida_em is not None])
            )

            meta_horas_semana = prova.horas_disponiveis_dia * prova.dias_disponiveis_semana
            indice = calcular_indice_preparacao(taxa_conclusao, horas_semana_atual, meta_horas_semana)

            resultado.append(
                ResumoComparacaoProva(
                    prova_id=prova.id,
                    nome=prova.nome,
                    total_horas_estudadas=total_horas,
                    total_sessoes=len(finalizadas),
                    taxa_conclusao_revisoes=taxa_conclusao,
                    indice_preparacao=indice,
                    classificacao_indice=classificar_indice(indice),
                )
            )

        return resultado