from app.application.interfaces.prova_repository import ProvaRepository
from app.infrastructure.db.models.prova import ProvaModel


class ListarProvas:
    def __init__(self, repository: ProvaRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> list[ProvaModel]:
        return self.repository.listar_por_usuario(usuario_id)