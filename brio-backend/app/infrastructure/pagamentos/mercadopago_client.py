import mercadopago

from app.infrastructure.config import settings


class MercadoPagoClient:
    """
    Única classe do projeto que fala com a API do Mercado Pago --
    todo o resto do sistema (use cases, domain) nunca importa o SDK
    do MP diretamente, só essa classe.
    """

    def __init__(self) -> None:
        print("========== MP CONFIG ==========")
        print("TOKEN EXISTE:", bool(token))
        print("TOKEN TAMANHO:", len(token))
        print("TOKEN INÍCIO:", token[:10])
        print("TOKEN FIM:", token[-6:])
        print("===============================")
        self._sdk = mercadopago.SDK(settings.mercadopago_access_token)

    def criar_preapproval(
        self,
        email_pagador: str,
        valor: float,
        frequencia_meses: int,
        motivo: str,
        referencia_externa: str,
        back_url: str,
    ) -> dict:
        corpo = {
            "reason": motivo,
            "external_reference": referencia_externa,
            "payer_email": email_pagador,
            "back_url": back_url,
            "auto_recurring": {
                "frequency": frequencia_meses,
                "frequency_type": "months",
                "transaction_amount": valor,
                "currency_id": "BRL",
            },
            "status": "pending",
        }
        resposta = self._sdk.preapproval().create(corpo)

        print("========== MERCADO PAGO ==========")
        print("STATUS:", resposta.get("status"))
        print("RESPOSTA:", resposta)
        print("==================================")

        return resposta["response"]

    def obter_preapproval(self, preapproval_id: str) -> dict:
        return self._sdk.preapproval().get(preapproval_id)["response"]

    def cancelar_preapproval(self, preapproval_id: str) -> dict:
        return self._sdk.preapproval().update(preapproval_id, {"status": "cancelled"})[
            "response"
        ]

    def obter_pagamento(self, payment_id: str) -> dict:
        return self._sdk.payment().get(payment_id)["response"]

    def reembolsar_pagamento(self, payment_id: str) -> dict:
        return self._sdk.refund().create(payment_id)["response"]