from datetime import datetime

from pydantic import BaseModel


class CotaIASchema(BaseModel):
    usadas: int
    limite: int
    quantidades_permitidas: list[int]


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

class MaterialResumoSchema(BaseModel):
    id: int
    nome_arquivo: str
    criado_em: datetime
    total_questoes: int
    questoes_respondidas: int
    questoes_acertadas: int
    aproveitamento: float | None

    model_config = {"from_attributes": True}


class QuestaoRevisaoSchema(BaseModel):
    id: int
    enunciado: str
    alternativas: AlternativasResponseSchema
    resposta_correta: str
    explicacao: str
    ultima_resposta: str | None
    ultima_acertou: bool | None
    respondida_em: datetime | None

    model_config = {"from_attributes": True}


class MaterialDetalheSchema(BaseModel):
    id: int
    nome_arquivo: str
    criado_em: datetime
    questoes: list[QuestaoRevisaoSchema]

    model_config = {"from_attributes": True}