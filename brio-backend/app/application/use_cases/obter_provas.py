from app.application.interfaces.prova_repository import ProvaRepository
from app.domain.exceptions import ProvaNaoEncontradaError
from app.infrastructure.db.models.prova import ProvaModel


class ObterProva:
    def __init__(self, repository: ProvaRepository) -> None:
        self.repository = repository

    def executar(self, prova_id: int, usuario_id: int) -> ProvaModel:
        prova = self.repository.buscar_por_id(prova_id)

        if prova is None or prova.usuario_id != usuario_id:
            raise ProvaNaoEncontradaError(f"Prova {prova_id} não encontrada")

        return prova