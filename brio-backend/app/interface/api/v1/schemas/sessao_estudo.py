from datetime import datetime

from pydantic import BaseModel, Field

from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class SessaoIniciarSchema(BaseModel):
    disciplina_id: int
    topico_id: int
    objetivo: str | None = Field(default=None, max_length=500)


class SessaoFinalizarSchema(BaseModel):
    concentracao: int = Field(ge=1, le=5)
    dificuldade: int = Field(ge=1, le=5)
    aprendizado_percentual: int = Field(ge=0, le=100)


class SessaoResponseSchema(BaseModel):
    id: int
    prova_id: int
    disciplina: str
    assunto: str
    objetivo: str | None
    iniciada_em: datetime
    finalizada_em: datetime | None
    duracao_minutos: int | None
    concentracao: int | None
    dificuldade: int | None
    aprendizado_percentual: int | None

    @classmethod
    def from_model(cls, sessao: SessaoEstudoModel) -> "SessaoResponseSchema":
        return cls(
            id=sessao.id,
            prova_id=sessao.prova_id,
            disciplina=sessao.disciplina,
            assunto=sessao.assunto,
            objetivo=sessao.objetivo,
            iniciada_em=sessao.iniciada_em,
            finalizada_em=sessao.finalizada_em,
            duracao_minutos=sessao.duracao_minutos,
            concentracao=sessao.concentracao,
            dificuldade=sessao.dificuldade,
            aprendizado_percentual=sessao.aprendizado_percentual,
        )