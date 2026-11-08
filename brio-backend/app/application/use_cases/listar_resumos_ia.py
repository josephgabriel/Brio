from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.infrastructure.db.models.resumo_ia import ResumoIAModel


class ListarResumosIA:
    def __init__(self, repository: ResumoIARepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> list[ResumoIAModel]:
        return self.repository.listar_por_usuario(usuario_id)