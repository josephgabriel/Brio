from app.application.interfaces.ia_repository import (
    AvaliacaoDesempenhoRepository,
    HistoricoRespostaRepository,
    QuestaoRepository,
)
from app.infrastructure.BrioIA.gemini_client import gerar_diagnostico
from app.infrastructure.db.models.avaliacao_desempenho import AvaliacaoDesempenhoModel


class GerarAvaliacaoDesempenho:
    def __init__(
        self,
        questao_repository: QuestaoRepository,
        historico_repository: HistoricoRespostaRepository,
        avaliacao_repository: AvaliacaoDesempenhoRepository,
    ) -> None:
        self.questao_repository = questao_repository
        self.historico_repository = historico_repository
        self.avaliacao_repository = avaliacao_repository

    def executar(self, usuario_id: int, material_id: int) -> AvaliacaoDesempenhoModel:
        questoes = self.questao_repository.listar_por_material(material_id)
        questoes_ids = [q.id for q in questoes]
        historico = self.historico_repository.listar_por_questoes(usuario_id, questoes_ids)

        total = len(historico)
        acertos = len([h for h in historico if h.acertou])
        erradas = [h for h in historico if not h.acertou]

        mapa_questoes = {q.id: q for q in questoes}
        linhas_erros = "\n".join(
            f"- {mapa_questoes[h.questao_id].enunciado[:150]}"
            for h in erradas
            if h.questao_id in mapa_questoes
        )

        resumo = (
            f"Total de questões respondidas: {total}\n"
            f"Acertos: {acertos}\n"
            f"Erros: {len(erradas)}\n"
            f"Questões que o aluno errou:\n{linhas_erros or '(nenhuma)'}"
        )

        diagnostico = gerar_diagnostico(resumo)

        return self.avaliacao_repository.criar(
            AvaliacaoDesempenhoModel(
                usuario_id=usuario_id,
                material_id=material_id,
                diagnostico=diagnostico,
                total_questoes=total,
                total_acertos=acertos,
            )
        )