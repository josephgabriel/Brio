import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base

class Plano(str, enum.Enum):
    MENSAL = "mensal"
    ANUAL = "anual"

class StatusAssinatura(str, enum.Enum):
    PENDENTE = "pendente"
    ATIVA = "ativa"
    CANCELADA = "cancelada"
    EXPIRADA = "expirada"

class AssinaturaModel(Base):
    __tablename__ = "assinaturas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, unique=True, index=True
    )
    plano: Mapped[Plano] = mapped_column(Enum(Plano), nullable=False)
    status: Mapped[StatusAssinatura] = mapped_column(
        Enum(StatusAssinatura), nullable=False, default=StatusAssinatura.PENDENTE
    )
    mercadopago_preapproval_id: Mapped[str | None] = mapped_column(String(100), index=True)
    data_inicio: Mapped[date | None] = mapped_column(Date)
    data_expiracao: Mapped[date | None] = mapped_column(Date)
    criada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    atualizada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now() 
    )