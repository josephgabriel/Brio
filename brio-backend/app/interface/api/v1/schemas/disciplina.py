# app/interface/api/v1/schemas/disciplina.py
from datetime import datetime

from pydantic import BaseModel, Field


class DisciplinaCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=200)


class DisciplinaResponseSchema(BaseModel):
    id: int
    prova_id: int
    nome: str
    nivel_conhecimento: int
    criada_em: datetime

    model_config = {"from_attributes": True}