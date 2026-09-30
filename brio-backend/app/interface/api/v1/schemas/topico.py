# app/interface/api/v1/schemas/topico.py
from datetime import datetime

from pydantic import BaseModel, Field


class TopicoCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=200)


class TopicoResponseSchema(BaseModel):
    id: int
    disciplina_id: int
    nome: str
    criada_em: datetime

    model_config = {"from_attributes": True}

class TopicoContextoSchema(BaseModel):
    topico_id: int
    topico_nome: str
    disciplina_id: int
    disciplina_nome: str
    prova_id: int
    prova_nome: str