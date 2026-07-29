from datetime import datetime

from pydantic import BaseModel


class AnotacaoSalvarSchema(BaseModel):
    conteudo_html: str


class AnotacaoResponseSchema(BaseModel):
    topico_id: int
    conteudo_html: str
    atualizada_em: datetime | None

    model_config = {"from_attributes": True}