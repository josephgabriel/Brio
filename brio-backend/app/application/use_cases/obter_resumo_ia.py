from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.domain.exceptions import ResumoNaoEncontradoError
from app.infrastructure.db.models.resumo_ia import ResumoIAModel


class ObterResumoIA:
    def __init__(self, repository: ResumoIARepository) -> None:
        self.repository = repository

    def executar(self, resumo_id: int, usuario_id: int) -> ResumoIAModel:
        resumo = self.repository.buscar_por_id(resumo_id)
        # Mesma mensagem para "não existe", "é de outra pessoa" e "arquivado"
        if resumo is None or resumo.usuario_id != usuario_id or resumo.arquivado_em is not None:
            raise ResumoNaoEncontradoError(f"Resumo {resumo_id} não encontrado")
        return resumo