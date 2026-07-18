from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class ListarSessoes:
    def __init__(self, repository: SessaoEstudoRepository) -> None:
        self.repository = repository

    def executar(
        self, usuario_id: int, prova_id: int | None = None
    ) -> list[SessaoEstudoModel]:
        return self.repository.listar_por_usuario(usuario_id, prova_id)