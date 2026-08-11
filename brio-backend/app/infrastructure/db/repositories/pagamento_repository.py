# app/infrastructure/db/repositories/pagamento_repository.py
from sqlalchemy.orm import Session

from app.application.interfaces.pagamento_repository import PagamentoRepository
from app.infrastructure.db.models.pagamento import PagamentoModel


class SQLAlchemyPagamentoRepository(PagamentoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, pagamento: PagamentoModel) -> PagamentoModel:
        self.db.add(pagamento)
        self.db.commit()
        self.db.refresh(pagamento)
        return pagamento

    def buscar_por_mercadopago_id(self, mercadopago_payment_id: str) -> PagamentoModel | None:
        return (
            self.db.query(PagamentoModel)
            .filter(PagamentoModel.mercadopago_payment_id == mercadopago_payment_id)
            .first()
        )

    def primeiro_pagamento_da_assinatura(self, assinatura_id: int) -> PagamentoModel | None:
        return (
            self.db.query(PagamentoModel)
            .filter(PagamentoModel.assinatura_id == assinatura_id)
            .order_by(PagamentoModel.criado_em.asc())
            .first()
        )