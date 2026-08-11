from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.application.use_cases.processar_webhook_assinatura import (
    ProcessarWebhookAssinatura,
)
from app.application.use_cases.processar_webhook_pagamento import ProcessarWebhookPagamento
from app.infrastructure.db.repositories.assinatura_repository import (
    SQLAlchemyAssinaturaRepository,
)
from app.infrastructure.db.repositories.pagamento_repository import (
    SQLAlchemyPagamentoRepository,
)
from app.infrastructure.db.session import get_db
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])


@router.post("/mercadopago")
async def mercadopago_webhook(request: Request, db: Session = Depends(get_db)):
    corpo = await request.json()
    tipo = corpo.get("type") or corpo.get("topic")
    dados_id = (corpo.get("data") or {}).get("id") or corpo.get("id")

    if not tipo or not dados_id:
        return {"recebido": True}

    cliente = MercadoPagoClient()

    if tipo == "subscription_preapproval":
        repository = SQLAlchemyAssinaturaRepository(db)
        ProcessarWebhookAssinatura(repository, cliente).executar(str(dados_id))
    elif tipo == "payment":
        assinatura_repository = SQLAlchemyAssinaturaRepository(db)
        pagamento_repository = SQLAlchemyPagamentoRepository(db)
        ProcessarWebhookPagamento(assinatura_repository, pagamento_repository, cliente).executar(
            str(dados_id)
        )

    return {"recebido": True}