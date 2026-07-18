from datetime import datetime, timezone

from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.use_cases.obter_revisao import ObterRevisao
from app.domain.exceptions import RevisaoJaConcluidaError
from app.infrastructure.db.models.revisao import RevisaoModel


class ConcluirRevisao:
    def __init__(self, repository: RevisaoRepository) -> None:
        self.repository = repository
        self.obter_revisao = ObterRevisao(repository)

    def executar(self, revisao_id: int, usuario_id: int) -> RevisaoModel:
        revisao = self.obter_revisao.executar(revisao_id, usuario_id)

        if revisao.concluida_em is not None:
            raise RevisaoJaConcluidaError(f"Revisão {revisao_id} já foi concluída")

        revisao.concluida_em = datetime.now(timezone.utc)
        return self.repository.atualizar(revisao)