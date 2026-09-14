from datetime import datetime

from pydantic import BaseModel


class CotaIASchema(BaseModel):
    usadas: int
    limite: int


class AlternativasResponseSchema(BaseModel):
    A: str
    B: str
    C: str
    D: str


class QuestaoResponseSchema(BaseModel):
    id: int
    enunciado: str
    alternativas: AlternativasResponseSchema

    model_config = {"from_attributes": True}


class MaterialComQuestoesResponseSchema(BaseModel):
    material_id: int
    questoes: list[QuestaoResponseSchema]


class ResponderQuestaoSchema(BaseModel):
    alternativa: str


class ResultadoRespostaSchema(BaseModel):
    correta: bool
    resposta_correta: str
    explicacao: str


class GerarAvaliacaoSchema(BaseModel):
    material_id: int


class AvaliacaoDesempenhoResponseSchema(BaseModel):
    diagnostico: str
    total_questoes: int
    total_acertos: int
    criado_em: datetime

    model_config = {"from_attributes": True}