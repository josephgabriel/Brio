from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, timedelta
from app.domain.regras.tempo import data_local, hoje_local

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_provas import ObterProva
from app.domain.regras.dashboard import calcular_horas_estudadas
from app.domain.regras.estatisticas import (
    gerar_semanas_recentes,
    gerar_meses_recentes,
    calcular_taxa_revisoes_em_dia,
)
from app.domain.regras.indice_preparacao import calcular_indice_preparacao, classificar_indice
from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.regras.progresso import calcular_cobertura_conteudo

@dataclass
class PontoEvolucaoSemanal:
    semana_inicio: date
    horas: float

@dataclass
class PontoEvolucaoMensal:
    mes: date
    horas: float


@dataclass
class EstatisticasProvaData:
    total_horas_estudadas: float
    total_sessoes: int
    horas_por_disciplina: dict[str, float]
    evolucao_semanal: list[PontoEvolucaoSemanal]
    evolucao_mensal: list[PontoEvolucaoMensal]
    taxa_revisoes_em_dia: float | None
    indice_preparacao: int | None
    classificacao_indice: str | None
    cobertura_conteudo: float | None
    horas_materias_removidas: float
    motivos: list[str] = field(default_factory=list)

class ObterEstatisticasProva:
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
        self.obter_prova = ObterProva(prova_repository)
        self.topico_repository = topico_repository

    def executar(self, prova_id: int, usuario_id: int) -> EstatisticasProvaData:
        prova = self.obter_prova.executar(prova_id, usuario_id)
        hoje = hoje_local()

        sessoes = self.sessao_repository.listar_por_usuario(usuario_id, prova_id)
        finalizadas = [
            s for s in sessoes if s.finalizada_em is not None and s.duracao_minutos is not None
        ]

        disciplinas = self.disciplina_repository.listar_por_prova(prova_id)
        nomes = {d.id: d.nome for d in disciplinas}

        minutos_por_id: dict[int, list[int]] = defaultdict(list)
        minutos_removidas: list[int] = []
        for sessao in finalizadas:
            if sessao.disciplina_id in nomes:
                minutos_por_id[sessao.disciplina_id].append(sessao.duracao_minutos)
            else:
                minutos_removidas.append(sessao.duracao_minutos)

        horas_por_disciplina: dict[str, float] = {}
        for disciplina_id, minutos in minutos_por_id.items():
            nome = nomes[disciplina_id]
            horas_por_disciplina[nome] = round(
                horas_por_disciplina.get(nome, 0.0) + calcular_horas_estudadas(minutos), 1
            )
        horas_materias_removidas = calcular_horas_estudadas(minutos_removidas)

        semanas = gerar_semanas_recentes(quantidade=8)
        minutos_por_semana: dict[date, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            data_sessao = data_local(sessao.finalizada_em)
            inicio_da_semana = data_sessao - timedelta(days=data_sessao.weekday())
            minutos_por_semana[inicio_da_semana].append(sessao.duracao_minutos)
        evolucao_semanal = [
            PontoEvolucaoSemanal(
                semana_inicio=semana,
                horas=calcular_horas_estudadas(minutos_por_semana.get(semana, [])),
            )
            for semana in semanas
        ]

        # Evolução mensal (últimos 6 meses)
        meses = gerar_meses_recentes(quantidade=6)
        minutos_por_mes: dict[date, list[int]] = defaultdict(list)
        for sessao in finalizadas:
            data_sessao = data_local(sessao.finalizada_em)
            inicio_do_mes = data_sessao.replace(day=1)
            minutos_por_mes[inicio_do_mes].append(sessao.duracao_minutos)

        evolucao_mensal = [
            PontoEvolucaoMensal(
                mes=mes,
                horas=calcular_horas_estudadas(minutos_por_mes.get(mes, [])),
            )
            for mes in meses
        ]

        revisoes = self.revisao_repository.listar_por_usuario(usuario_id, prova_id)
        taxa_revisoes = calcular_taxa_revisoes_em_dia(
            [(r.data_agendada, r.concluida_em is not None) for r in revisoes], hoje
        )

        # Novo trecho integrado
        contagens = self.topico_repository.contar_por_disciplinas([d.id for d in disciplinas])
        cobertura = calcular_cobertura_conteudo(contagens)

        inicio_semana_atual = hoje - timedelta(days=hoje.weekday())
        horas_semana_atual = calcular_horas_estudadas(
            minutos_por_semana.get(inicio_semana_atual, [])
        )
        meta_horas_semana = prova.horas_disponiveis_dia * prova.dias_disponiveis_semana

        indice = calcular_indice_preparacao(
            taxa_revisoes, horas_semana_atual, meta_horas_semana, cobertura
        )
        classificacao = classificar_indice(indice)

        motivos: list[str] = []
        if cobertura is None:
            motivos.append(
                "Cadastre conteúdos nas matérias e marque os concluídos para o índice "
                "considerar seu avanço no conteúdo."
            )
        elif cobertura < 50:
            motivos.append(f"Você concluiu {round(cobertura)}% dos conteúdos desta prova.")
        if taxa_revisoes < 50:
            motivos.append("Menos da metade das revisões agendadas foram concluídas.")
        if meta_horas_semana > 0 and horas_semana_atual < meta_horas_semana * 0.7:
            motivos.append("Você estudou menos horas do que sua meta semanal para esta prova.")
        if not motivos:
            motivos.append("Seu ritmo está alinhado com a meta definida para esta prova.")

        return EstatisticasProvaData(
            total_horas_estudadas=calcular_horas_estudadas(
                [s.duracao_minutos for s in finalizadas]
            ),
            total_sessoes=len(finalizadas),
            horas_por_disciplina=horas_por_disciplina,
            evolucao_semanal=evolucao_semanal,
            taxa_revisoes_em_dia=taxa_revisoes,
            indice_preparacao=indice,
            classificacao_indice=classificacao,
            motivos=motivos,
            evolucao_mensal=evolucao_mensal,
            cobertura_conteudo=cobertura,
            horas_materias_removidas=horas_materias_removidas,
        )