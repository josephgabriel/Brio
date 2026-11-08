from datetime import datetime, timezone

from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.application.use_cases.obter_resumo_ia import ObterResumoIA


class ArquivarResumoIA:
    def __init__(self, repository: ResumoIARepository) -> None:
        self.repository = repository
        self.obter_resumo = ObterResumoIA(repository)

    def executar(self, resumo_id: int, usuario_id: int) -> None:
        resumo = self.obter_resumo.executar(resumo_id, usuario_id)
        resumo.arquivado_em = datetime.now(timezone.utc)
        self.repository.atualizar(resumo)