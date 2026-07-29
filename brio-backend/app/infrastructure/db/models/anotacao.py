from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class AnotacaoModel(Base):
    __tablename__ = "anotacoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    topico_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("topicos.id"), nullable=False, unique=True, index=True
    )
    conteudo_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    atualizada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )