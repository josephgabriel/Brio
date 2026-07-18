from app.application.interfaces.revisao_repository import RevisaoRepository
from app.domain.exceptions import RevisaoNaoEncontradaError
from app.infrastructure.db.models.revisao import RevisaoModel


class ObterRevisao:
    def __init__(self, repository: RevisaoRepository) -> None:
        self.repository = repository

    def executar(self, revisao_id: int, usuario_id: int) -> RevisaoModel:
        revisao = self.repository.buscar_por_id(revisao_id)

        if revisao is None or revisao.usuario_id != usuario_id:
            raise RevisaoNaoEncontradaError(f"Revisão {revisao_id} não encontrada")

        return revisao