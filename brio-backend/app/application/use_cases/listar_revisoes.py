from datetime import date

from app.application.interfaces.revisao_repository import RevisaoRepository
from app.infrastructure.db.models.revisao import RevisaoModel


class ListarRevisoes:
    def __init__(self, repository: RevisaoRepository) -> None:
        self.repository = repository

    def executar(
        self,
        usuario_id: int,
        prova_id: int | None = None,
        apenas_pendentes: bool = False,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[RevisaoModel]:
        return self.repository.listar_por_usuario(
            usuario_id, prova_id, apenas_pendentes, data_inicio, data_fim
        )


class ListarRevisoesDeHoje:
    def __init__(self, repository: RevisaoRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> list[RevisaoModel]:
        return self.repository.listar_ate_data(usuario_id, date.today())