from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

TipoAtividade = Literal["estudo", "revisao", "questoes", "simulado"]


class AtividadeCronogramaSchema(BaseModel):
    tipo: TipoAtividade = "estudo"
    disciplina_id: int | None = None
    titulo: str | None = Field(default=None, max_length=120)
    foco: str | None = Field(default=None, max_length=120)
    dia_semana: int = Field(ge=0, le=6)
    horario_inicio: time | None = None
    duracao_minutos: int = Field(gt=0, le=600)

    @field_validator("titulo", "foco", mode="before")
    @classmethod
    def vazio_vira_nulo(cls, valor):
        if isinstance(valor, str):
            valor = valor.strip()
            return valor or None
        return valor

    @model_validator(mode="after")
    def exigir_materia_ou_titulo(self):
        if self.disciplina_id is None and not self.titulo:
            raise ValueError("Informe uma matéria ou um título")
        return self


class ConclusaoSchema(BaseModel):
    data: date
    concluido: bool


class OcorrenciaCronogramaSchema(BaseModel):
    item_id: int
    data: date
    titulo: str
    titulo_personalizado: str | None
    foco: str | None
    tipo: TipoAtividade
    disciplina_id: int | None
    disciplina_nome: str | None
    prova_id: int | None
    prova_nome: str | None
    dia_semana: int
    horario_inicio: time | None
    duracao_minutos: int
    concluido: bool