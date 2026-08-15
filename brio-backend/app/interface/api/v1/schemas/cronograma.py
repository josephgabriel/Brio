# app/interface/api/v1/schemas/cronograma.py
from datetime import time

from pydantic import BaseModel, Field


class ItemCronogramaCreateSchema(BaseModel):
    disciplina_id: int
    dia_semana: int = Field(ge=0, le=6)
    duracao_minutos: int = Field(gt=0, le=600)
    horario_inicio: time | None = None


class ItemCronogramaResponseSchema(BaseModel):
    id: int
    disciplina_id: int
    disciplina_nome: str
    prova_nome: str
    dia_semana: int
    horario_inicio: time | None
    duracao_minutos: int