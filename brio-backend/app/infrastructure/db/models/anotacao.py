from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.session import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.infrastructure.db.models.topico import TopicoModel


class AnotacaoModel(Base):
    __tablename__ = "anotacoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True
    )
    topico_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("topicos.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    conteudo_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    atualizada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    topico: Mapped["TopicoModel"] = relationship(back_populates="anotacoes")