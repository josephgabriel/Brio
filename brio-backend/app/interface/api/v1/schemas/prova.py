from datetime import date, datetime

from pydantic import BaseModel, Field

from app.domain.regras.prova import calcular_dias_restantes
from app.infrastructure.db.models.prova import (
    PrioridadeProva,
    ProvaModel,
    StatusProva,
    TipoProva,
)


class ProvaCreateSchema(BaseModel):
    nome: str = Field(min_length=2, max_length=200)
    tipo: TipoProva
    instituicao_banca: str | None = Field(default=None, max_length=200)
    cargo: str | None = Field(default=None, max_length=200)
    data_prova: date | None = None
    data_divulgacao_edital: date | None = None
    horas_disponiveis_dia: float = Field(gt=0, le=24)
    dias_disponiveis_semana: int = Field(ge=1, le=7)
    prioridade: PrioridadeProva = PrioridadeProva.MEDIA


class ProvaUpdateSchema(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=200)
    tipo: TipoProva | None = None
    instituicao_banca: str | None = Field(default=None, max_length=200)
    cargo: str | None = Field(default=None, max_length=200)
    data_prova: date | None = None
    data_divulgacao_edital: date | None = None
    horas_disponiveis_dia: float | None = Field(default=None, gt=0, le=24)
    dias_disponiveis_semana: int | None = Field(default=None, ge=1, le=7)
    prioridade: PrioridadeProva | None = None
    status: StatusProva | None = None


class ProvaResponseSchema(BaseModel):
    id: int
    nome: str
    tipo: TipoProva
    instituicao_banca: str | None
    cargo: str | None
    data_prova: date | None
    data_divulgacao_edital: date | None
    horas_disponiveis_dia: float
    dias_disponiveis_semana: int
    prioridade: PrioridadeProva
    status: StatusProva
    criada_em: datetime
    dias_restantes: int | None

    @classmethod
    def from_model(cls, prova: ProvaModel) -> "ProvaResponseSchema":
        """
        Monta o schema de resposta a partir do ProvaModel, calculando
        `dias_restantes` na hora -- esse campo não existe como coluna
        no banco, é derivado usando a regra de domínio pura.
        """
        return cls(
            id=prova.id,
            nome=prova.nome,
            tipo=prova.tipo,
            instituicao_banca=prova.instituicao_banca,
            cargo=prova.cargo,
            data_prova=prova.data_prova,
            data_divulgacao_edital=prova.data_divulgacao_edital,
            horas_disponiveis_dia=prova.horas_disponiveis_dia,
            dias_disponiveis_semana=prova.dias_disponiveis_semana,
            prioridade=prova.prioridade,
            status=prova.status,
            criada_em=prova.criada_em,
            dias_restantes=calcular_dias_restantes(prova.data_prova),
        )