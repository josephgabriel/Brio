from datetime import datetime

from pydantic import BaseModel


class CotaResumosSchema(BaseModel):
    usadas: int
    limite: int
    niveis: list[str]


class ConceitoSchema(BaseModel):
    termo: str
    definicao: str


class TopicoResumoSchema(BaseModel):
    titulo: str
    pontos: list[str]


class ResumoConteudoSchema(BaseModel):
    titulo: str
    visao_geral: str
    topicos: list[TopicoResumoSchema]
    conceitos_chave: list[ConceitoSchema]
    para_memorizar: list[str]


class ResumoItemSchema(BaseModel):
    id: int
    nome_arquivo: str
    titulo: str
    nivel: str
    criado_em: datetime
    paginas_lidas: int
    total_paginas: int

    model_config = {"from_attributes": True}


class ResumoDetalheSchema(ResumoItemSchema):
    conteudo: ResumoConteudoSchema