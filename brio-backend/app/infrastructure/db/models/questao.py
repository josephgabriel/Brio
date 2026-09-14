from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class QuestaoModel(Base):
    __tablename__ = "questoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    material_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("materiais_estudo.id"), nullable=False, index=True
    )
    enunciado: Mapped[str] = mapped_column(Text, nullable=False)
    alternativas: Mapped[dict] = mapped_column(JSON, nullable=False)
    resposta_correta: Mapped[str] = mapped_column(String(1), nullable=False)
    explicacao: Mapped[str] = mapped_column(Text, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )