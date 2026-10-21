# app/interface/api/v1/schemas/disciplina.py
from datetime import datetime

from pydantic import BaseModel, Field


class DisciplinaCreateSchema(BaseModel):
    nome: str = Field(min_length=1, max_length=200)


class DisciplinaResponseSchema(BaseModel):
    id: int
    prova_id: int
    nome: str
    criada_em: datetime
    total_topicos: int = 0
    topicos_concluidos: int = 0
    progresso_percentual: float = 0.0

    model_config = {"from_attributes": True}