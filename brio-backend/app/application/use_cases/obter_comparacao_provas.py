from dataclasses import dataclass
from datetime import timedelta

from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import calcular_taxa_revisoes_em_dia
from app.domain.regras.indice_preparacao import calcular_indice_preparacao, classificar_indice
from app.infrastructure.db.models.prova import StatusProva
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.regras.progresso import calcular_cobertura_conteudo
from app.domain.regras.tempo import data_local, hoje_local

@dataclass
class ResumoComparacaoProva:
    prova_id: int
    nome: str
    total_horas_estudadas: float
    total_sessoes: int
    taxa_revisoes_em_dia: float | None
    cobertura_conteudo: float | None
    indice_preparacao: int
    classificacao_indice: str


class ObterComparacaoProvas:
    def __init__(
        self,
        prova_repository: ProvaRepository,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
        disciplina_repository: DisciplinaRepository,
        topico_repository: TopicoRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.disciplina_repository = disciplina_repository
        self.topico_repository = topico_repository

    def executar(self, usuario_id: int) -> list[ResumoComparacaoProva]:
        hoje = hoje_local()
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
                    if data_local(s.finalizada_em) >= inicio_semana_atual
                ]
            )

            revisoes = self.revisao_repository.listar_por_usuario(usuario_id, prova.id)
            taxa_revisoes = calcular_taxa_revisoes_em_dia(
                [(r.data_agendada, r.concluida_em is not None) for r in revisoes], hoje
            )

            meta_horas_semana = prova.horas_disponiveis_dia * prova.dias_disponiveis_semana
            disciplinas = self.disciplina_repository.listar_por_prova(prova.id)
            contagens = self.topico_repository.contar_por_disciplinas(
                [d.id for d in disciplinas]
            )
            cobertura = calcular_cobertura_conteudo(contagens)
            indice = calcular_indice_preparacao(
                taxa_revisoes, horas_semana_atual, meta_horas_semana, cobertura
            )
            resultado.append(
                ResumoComparacaoProva(
                    prova_id=prova.id,
                    nome=prova.nome,
                    total_horas_estudadas=total_horas,
                    total_sessoes=len(finalizadas),
                    taxa_revisoes_em_dia=taxa_revisoes,
                    cobertura_conteudo=cobertura,
                    indice_preparacao=indice,
                    classificacao_indice=classificar_indice(indice),
                )
            )

        return resultado