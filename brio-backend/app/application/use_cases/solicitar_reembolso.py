# app/application/use_cases/solicitar_reembolso.py
from datetime import date

from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.application.interfaces.pagamento_repository import PagamentoRepository
from app.domain.exceptions import AssinaturaNaoEncontradaError, ForaDoPrazoReembolsoError
from app.domain.regras.assinatura import esta_dentro_do_prazo_reembolso
from app.infrastructure.db.models.assinatura import StatusAssinatura
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient


class SolicitarReembolso:
    def __init__(
        self,
        assinatura_repository: AssinaturaRepository,
        pagamento_repository: PagamentoRepository,
        mercadopago_client: MercadoPagoClient,
    ) -> None:
        self.assinatura_repository = assinatura_repository
        self.pagamento_repository = pagamento_repository
        self.mercadopago_client = mercadopago_client

    def executar(self, usuario_id: int) -> None:
        assinatura = self.assinatura_repository.buscar_por_usuario(usuario_id)
        if assinatura is None or assinatura.status != StatusAssinatura.ATIVA:
            raise AssinaturaNaoEncontradaError("Nenhuma assinatura ativa encontrada")

        primeiro_pagamento = self.pagamento_repository.primeiro_pagamento_da_assinatura(
            assinatura.id
        )
        if primeiro_pagamento is None:
            raise AssinaturaNaoEncontradaError("Nenhum pagamento encontrado para essa assinatura")

        if not esta_dentro_do_prazo_reembolso(primeiro_pagamento.criado_em.date(), date.today()):
            raise ForaDoPrazoReembolsoError("O prazo de 7 dias para reembolso já passou")

        self.mercadopago_client.reembolsar_pagamento(primeiro_pagamento.mercadopago_payment_id)
        if assinatura.mercadopago_preapproval_id:
            self.mercadopago_client.cancelar_preapproval(assinatura.mercadopago_preapproval_id)

        assinatura.status = StatusAssinatura.CANCELADA
        assinatura.data_expiracao = date.today()
        self.assinatura_repository.atualizar(assinatura)