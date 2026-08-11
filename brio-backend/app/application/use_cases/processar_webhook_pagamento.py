# app/application/use_cases/processar_webhook_pagamento.py
from datetime import date

from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.application.interfaces.pagamento_repository import PagamentoRepository
from app.domain.regras.assinatura import calcular_data_expiracao
from app.infrastructure.db.models.assinatura import StatusAssinatura
from app.infrastructure.db.models.pagamento import PagamentoModel
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient


class ProcessarWebhookPagamento:
    def __init__(
        self,
        assinatura_repository: AssinaturaRepository,
        pagamento_repository: PagamentoRepository,
        mercadopago_client: MercadoPagoClient,
    ) -> None:
        self.assinatura_repository = assinatura_repository
        self.pagamento_repository = pagamento_repository
        self.mercadopago_client = mercadopago_client

    def executar(self, payment_id: str) -> None:
        if self.pagamento_repository.buscar_por_mercadopago_id(payment_id) is not None:
            return

        dados = self.mercadopago_client.obter_pagamento(payment_id)
        if dados.get("status") != "approved":
            return

        preapproval_id = dados.get("preapproval_id")
        if not preapproval_id:
            return

        assinatura = self.assinatura_repository.buscar_por_preapproval_id(preapproval_id)
        if assinatura is None:
            return

        self.pagamento_repository.criar(
            PagamentoModel(
                assinatura_id=assinatura.id,
                mercadopago_payment_id=payment_id,
                valor=dados.get("transaction_amount", 0.0),
                status=dados["status"],
            )
        )

        assinatura.status = StatusAssinatura.ATIVA
        assinatura.data_expiracao = calcular_data_expiracao(assinatura.plano)
        if assinatura.data_inicio is None:
            assinatura.data_inicio = date.today()
        self.assinatura_repository.atualizar(assinatura)