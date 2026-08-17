from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.session import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.infrastructure.db.models.topico import TopicoModel


class RevisaoModel(Base):
    __tablename__ = "revisoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prova_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("provas.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sessao_estudo_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sessoes_estudo.id", ondelete="CASCADE"), nullable=False, index=True
    )

    topico_id: Mapped[int| None] = mapped_column(
        Integer, ForeignKey("topicos.id"), nullable=True, index=True
    )
    
    disciplina: Mapped[str] = mapped_column(String(200), nullable=False)
    assunto: Mapped[str] = mapped_column(String(200), nullable=False)

    intervalo_numero: Mapped[int] = mapped_column(Integer, nullable=False)
    data_agendada: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    concluida_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    criada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    topico: Mapped["TopicoModel"] = relationship(back_populates="revisoes")