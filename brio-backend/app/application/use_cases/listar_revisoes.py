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
    ) -> list[RevisaoModel]:
        return self.repository.listar_por_usuario(usuario_id, prova_id, apenas_pendentes)


class ListarRevisoesDeHoje:
    def __init__(self, repository: RevisaoRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> list[RevisaoModel]:
        # "De hoje" inclui atrasadas -- revisão que venceu ontem e
        # não foi feita continua aparecendo até ser concluída.
        return self.repository.listar_ate_data(usuario_id, date.today())