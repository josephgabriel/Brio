# app/interface/api/v1/schemas/calendario.py
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.infrastructure.db.models.evento_calendario import TipoEvento


class EventoCreateSchema(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    data: date
    tipo: TipoEvento = TipoEvento.EVENTO
    descricao: str | None = Field(default=None, max_length=1000)


class EventoUpdateSchema(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=200)
    data: date | None = None
    tipo: TipoEvento | None = None
    descricao: str | None = Field(default=None, max_length=1000)
    concluido: bool | None = None


class EventoResponseSchema(BaseModel):
    id: int
    titulo: str
    descricao: str | None
    data: date
    tipo: TipoEvento
    concluido: bool
    criado_em: datetime

    model_config = {"from_attributes": True}


class ItemCalendarioSchema(BaseModel):
    tipo: str
    id: int
    titulo: str
    data: date
    concluido: bool | None
    rota: str | None