# app/application/use_cases/processar_webhook_assinatura.py
from datetime import date

from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.domain.regras.assinatura import calcular_data_expiracao
from app.infrastructure.db.models.assinatura import StatusAssinatura
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient


class ProcessarWebhookAssinatura:
    def __init__(
        self, repository: AssinaturaRepository, mercadopago_client: MercadoPagoClient
    ) -> None:
        self.repository = repository
        self.mercadopago_client = mercadopago_client

    def executar(self, preapproval_id: str) -> None:
        assinatura = self.repository.buscar_por_preapproval_id(preapproval_id)
        if assinatura is None:
            return

        dados = self.mercadopago_client.obter_preapproval(preapproval_id)
        status_mp = dados.get("status")

        if status_mp == "authorized":
            assinatura.status = StatusAssinatura.ATIVA
            if assinatura.data_inicio is None:
                assinatura.data_inicio = date.today()
                assinatura.data_expiracao = calcular_data_expiracao(assinatura.plano)
        elif status_mp in ("cancelled", "paused"):
            assinatura.status = StatusAssinatura.CANCELADA

        self.repository.atualizar(assinatura)