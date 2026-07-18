from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.exceptions import SessaoNaoEncontradaError
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class ObterSessao:
    def __init__(self, repository: SessaoEstudoRepository) -> None:
        self.repository = repository

    def executar(self, sessao_id: int, usuario_id: int) -> SessaoEstudoModel:
        sessao = self.repository.buscar_por_id(sessao_id)

        if sessao is None or sessao.usuario_id != usuario_id:
            raise SessaoNaoEncontradaError(f"Sessão {sessao_id} não encontrada")

        return sessao