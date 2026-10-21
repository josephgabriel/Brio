from dataclasses import dataclass
from datetime import datetime

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.regras.estatisticas import calcular_taxa_conclusao


@dataclass
class DisciplinaComProgresso:
    id: int
    prova_id: int
    nome: str
    criada_em: datetime
    total_topicos: int
    topicos_concluidos: int
    progresso_percentual: float


class ListarDisciplinas:
    def __init__(
        self,
        disciplina_repository: DisciplinaRepository,
        topico_repository: TopicoRepository,
    ) -> None:
        self.disciplina_repository = disciplina_repository
        self.topico_repository = topico_repository

    def executar(self, prova_id: int, usuario_id: int) -> list[DisciplinaComProgresso]:
        disciplinas = [
            d
            for d in self.disciplina_repository.listar_por_prova(prova_id)
            if d.usuario_id == usuario_id
        ]
        contagens = self.topico_repository.contar_por_disciplinas([d.id for d in disciplinas])

        resultado: list[DisciplinaComProgresso] = []
        for disciplina in disciplinas:
            total, concluidos = contagens.get(disciplina.id, (0, 0))
            resultado.append(
                DisciplinaComProgresso(
                    id=disciplina.id,
                    prova_id=disciplina.prova_id,
                    nome=disciplina.nome,
                    criada_em=disciplina.criada_em,
                    total_topicos=total,
                    topicos_concluidos=concluidos,
                    progresso_percentual=calcular_taxa_conclusao(total, concluidos),
                )
            )
        return resultado