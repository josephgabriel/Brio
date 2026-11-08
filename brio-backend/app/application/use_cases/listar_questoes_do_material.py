from dataclasses import dataclass
from datetime import datetime

from app.application.interfaces.ia_repository import (
    HistoricoRespostaRepository,
    MaterialEstudoRepository,
    QuestaoRepository,
)
from app.domain.exceptions import MaterialNaoEncontradoError
from app.domain.regras.ia_historico import Tentativa, ultima_tentativa_por_questao


@dataclass
class QuestaoRevisao:
    id: int
    enunciado: str
    alternativas: dict
    resposta_correta: str
    explicacao: str
    ultima_resposta: str | None
    ultima_acertou: bool | None
    respondida_em: datetime | None


@dataclass
class MaterialDetalhe:
    id: int
    nome_arquivo: str
    criado_em: datetime
    questoes: list[QuestaoRevisao]


class ListarQuestoesDoMaterial:
    def __init__(
        self,
        material_repository: MaterialEstudoRepository,
        questao_repository: QuestaoRepository,
        historico_repository: HistoricoRespostaRepository,
    ) -> None:
        self.material_repository = material_repository
        self.questao_repository = questao_repository
        self.historico_repository = historico_repository

    def executar(self, material_id: int, usuario_id: int) -> MaterialDetalhe:
        material = self.material_repository.buscar_por_id(material_id)
        if material is None or material.usuario_id != usuario_id:
            raise MaterialNaoEncontradoError(f"Material {material_id} não encontrado")

        questoes = sorted(
            self.questao_repository.listar_por_material(material_id), key=lambda q: q.id
        )
        historico = (
            self.historico_repository.listar_por_questoes(usuario_id, [q.id for q in questoes])
            if questoes
            else []
        )
        ultimas = ultima_tentativa_por_questao(
            [
                Tentativa(
                    questao_id=h.questao_id,
                    alternativa=h.alternativa_selecionada,
                    acertou=h.acertou,
                    respondida_em=h.respondido_em,
                    id=h.id,
                )
                for h in historico
            ]
        )

        return MaterialDetalhe(
            id=material.id,
            nome_arquivo=material.nome_arquivo,
            criado_em=material.criado_em,
            questoes=[
                QuestaoRevisao(
                    id=q.id,
                    enunciado=q.enunciado,
                    alternativas=q.alternativas,
                    resposta_correta=q.resposta_correta,
                    explicacao=q.explicacao,
                    ultima_resposta=ultimas[q.id].alternativa if q.id in ultimas else None,
                    ultima_acertou=ultimas[q.id].acertou if q.id in ultimas else None,
                    respondida_em=ultimas[q.id].respondida_em if q.id in ultimas else None,
                )
                for q in questoes
            ],
        )