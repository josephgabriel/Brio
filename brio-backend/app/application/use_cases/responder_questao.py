from dataclasses import dataclass

from app.application.interfaces.ia_repository import (
    HistoricoRespostaRepository,
    MaterialEstudoRepository,
    QuestaoRepository,
)
from app.domain.exceptions import QuestaoNaoEncontradaError
from app.infrastructure.db.models.historico_resposta import HistoricoRespostaModel


@dataclass
class ResultadoResposta:
    correta: bool
    resposta_correta: str
    explicacao: str


class ResponderQuestao:
    def __init__(
        self,
        questao_repository: QuestaoRepository,
        material_repository: MaterialEstudoRepository,
        historico_repository: HistoricoRespostaRepository,
    ) -> None:
        self.questao_repository = questao_repository
        self.material_repository = material_repository
        self.historico_repository = historico_repository

    def executar(
        self, questao_id: int, usuario_id: int, alternativa_selecionada: str
    ) -> ResultadoResposta:
        questao = self.questao_repository.buscar_por_id(questao_id)
        if questao is None:
            raise QuestaoNaoEncontradaError(f"Questão {questao_id} não encontrada")

        material = self.material_repository.buscar_por_id(questao.material_id)
        if material is None or material.usuario_id != usuario_id:
            raise QuestaoNaoEncontradaError(f"Questão {questao_id} não encontrada")

        acertou = alternativa_selecionada == questao.resposta_correta

        self.historico_repository.criar(
            HistoricoRespostaModel(
                usuario_id=usuario_id,
                questao_id=questao_id,
                alternativa_selecionada=alternativa_selecionada,
                acertou=acertou,
            )
        )

        return ResultadoResposta(
            correta=acertou,
            resposta_correta=questao.resposta_correta,
            explicacao=questao.explicacao,
        )