import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class TipoProva(str, enum.Enum):
    ENEM = "enem"
    VESTIBULAR = "vestibular"
    CONCURSO = "concurso"


class PrioridadeProva(str, enum.Enum):
    ALTA = "alta"
    MEDIA = "media"
    BAIXA = "baixa"


class StatusProva(str, enum.Enum):
    ATIVA = "ativa"
    CONCLUIDA = "concluida"
    ARQUIVADA = "arquivada"


class ProvaModel(Base):
    """
    Representação da tabela `provas` no banco.

    Este é um modelo de INFRAESTRUTURA -- descreve como os dados são
    gravados. A partir da Etapa 6, a primeira regra de negócio real
    (cálculo de dias restantes) foi extraída como função pura em
    app/domain/regras/prova.py, mas o modelo continua sendo usado
    diretamente pelos use cases -- uma entidade de domínio completa
    e separada fica como melhoria futura, se a complexidade justificar.
    """

    __tablename__ = "provas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[TipoProva] = mapped_column(Enum(TipoProva), nullable=False)
    instituicao_banca: Mapped[str | None] = mapped_column(String(200))
    cargo: Mapped[str | None] = mapped_column(String(200))
    data_prova: Mapped[date | None] = mapped_column(Date, nullable=True)
    data_divulgacao_edital: Mapped[date | None] = mapped_column(Date)
    horas_disponiveis_dia: Mapped[float] = mapped_column(Float, nullable=False)
    dias_disponiveis_semana: Mapped[int] = mapped_column(Integer, nullable=False)
    prioridade: Mapped[PrioridadeProva] = mapped_column(
        Enum(PrioridadeProva), nullable=False, default=PrioridadeProva.MEDIA
    )
    status: Mapped[StatusProva] = mapped_column(
        Enum(StatusProva), nullable=False, default=StatusProva.ATIVA
    )
    criada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )