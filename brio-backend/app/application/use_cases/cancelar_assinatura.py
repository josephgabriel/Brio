from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.domain.exceptions import AssinaturaNaoEncontradaError
from app.infrastructure.db.models.assinatura import AssinaturaModel, StatusAssinatura
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient


class CancelarAssinatura:
    def __init__(
        self, repository: AssinaturaRepository, mercadopago_client: MercadoPagoClient
    ) -> None:
        self.repository = repository
        self.mercadopago_client = mercadopago_client

    def executar(self, usuario_id: int) -> AssinaturaModel:
        assinatura = self.repository.buscar_por_usuario(usuario_id)
        if assinatura is None or assinatura.status != StatusAssinatura.ATIVA:
            raise AssinaturaNaoEncontradaError("Nenhuma assinatura ativa encontrada")

        if not assinatura.renovacao_automatica:
            return assinatura  # já estava cancelada, não faz nada de novo

        if assinatura.mercadopago_preapproval_id:
            self.mercadopago_client.cancelar_preapproval(assinatura.mercadopago_preapproval_id)

        assinatura.renovacao_automatica = False
        return self.repository.atualizar(assinatura)