# app/interface/api/v1/schemas/assinatura.py
from datetime import date, datetime

from pydantic import BaseModel

from app.infrastructure.db.models.assinatura import Plano, StatusAssinatura


class CriarAssinaturaSchema(BaseModel):
    plano: Plano


class CriarAssinaturaResponseSchema(BaseModel):
    checkout_url: str


class AssinaturaResponseSchema(BaseModel):
    plano: Plano
    status: StatusAssinatura
    data_inicio: date | None
    data_expiracao: date | None
    criada_em: datetime

    model_config = {"from_attributes": True}