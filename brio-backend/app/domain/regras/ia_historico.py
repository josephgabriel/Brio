from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Tentativa:
    questao_id: int
    alternativa: str
    acertou: bool
    respondida_em: datetime
    id: int


def ultima_tentativa_por_questao(tentativas: list[Tentativa]) -> dict[int, Tentativa]:
    """
    Para cada questão, fica só a resposta mais recente. Ordena por data e, em caso
    de empate, pelo id: respostas gravadas no mesmo instante têm uma ordem certa.
    """
    ultimas: dict[int, Tentativa] = {}
    for tentativa in sorted(tentativas, key=lambda t: (t.respondida_em, t.id)):
        ultimas[tentativa.questao_id] = tentativa
    return ultimas