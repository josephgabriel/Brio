from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime

from app.application.interfaces.ia_repository import (
    HistoricoRespostaRepository,
    MaterialEstudoRepository,
    QuestaoRepository,
)
from app.domain.regras.estatisticas import calcular_taxa_conclusao
from app.domain.regras.ia_historico import Tentativa, ultima_tentativa_por_questao


@dataclass
class ResumoMaterial:
    id: int
    nome_arquivo: str
    criado_em: datetime
    total_questoes: int
    questoes_respondidas: int
    questoes_acertadas: int
    aproveitamento: float | None


class ListarMateriaisIA:
    def __init__(
        self,
        material_repository: MaterialEstudoRepository,
        questao_repository: QuestaoRepository,
        historico_repository: HistoricoRespostaRepository,
    ) -> None:
        self.material_repository = material_repository
        self.questao_repository = questao_repository
        self.historico_repository = historico_repository

    def executar(self, usuario_id: int) -> list[ResumoMaterial]:
        materiais = self.material_repository.listar_por_usuario(usuario_id)
        if not materiais:
            return []

        questoes = self.questao_repository.listar_por_materiais([m.id for m in materiais])
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

        questoes_por_material: dict[int, list] = defaultdict(list)
        for questao in questoes:
            questoes_por_material[questao.material_id].append(questao)

        resumos: list[ResumoMaterial] = []
        for material in materiais:
            do_material = questoes_por_material.get(material.id, [])
            respondidas = [q for q in do_material if q.id in ultimas]
            acertadas = [q for q in respondidas if ultimas[q.id].acertou]
            resumos.append(
                ResumoMaterial(
                    id=material.id,
                    nome_arquivo=material.nome_arquivo,
                    criado_em=material.criado_em,
                    total_questoes=len(do_material),
                    questoes_respondidas=len(respondidas),
                    questoes_acertadas=len(acertadas),
                    aproveitamento=(
                        calcular_taxa_conclusao(len(respondidas), len(acertadas))
                        if respondidas
                        else None
                    ),
                )
            )
        return resumos