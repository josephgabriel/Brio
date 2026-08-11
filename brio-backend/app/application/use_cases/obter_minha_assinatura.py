# app/application/use_cases/obter_minha_assinatura.py
from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.infrastructure.db.models.assinatura import AssinaturaModel


class ObterMinhaAssinatura:
    def __init__(self, repository: AssinaturaRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> AssinaturaModel | None:
        return self.repository.buscar_por_usuario(usuario_id)