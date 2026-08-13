import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base

class TipoEvento(str, enum.Enum):
    EVENTO = "evento"
    TAREFA = "tarefa"

class EventoCalendarioModel(Base):
    __tablename__ = "eventos_calendario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )

    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(String(1000))
    data: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    tipo: Mapped[TipoEvento] = mapped_column(
        Enum(TipoEvento), nullable=False, default=TipoEvento.EVENTO
    )
    concluido: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
