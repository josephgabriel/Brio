# app/application/interfaces/pagamento_repository.py
from abc import ABC, abstractmethod

from app.infrastructure.db.models.pagamento import PagamentoModel


class PagamentoRepository(ABC):
    @abstractmethod
    def criar(self, pagamento: PagamentoModel) -> PagamentoModel: ...

    @abstractmethod
    def buscar_por_mercadopago_id(self, mercadopago_payment_id: str) -> PagamentoModel | None: ...

    @abstractmethod
    def primeiro_pagamento_da_assinatura(self, assinatura_id: int) -> PagamentoModel | None: ...