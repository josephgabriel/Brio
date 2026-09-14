from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class AvaliacaoDesempenhoModel(Base):
    __tablename__ = "avaliacoes_desempenho"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    material_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("materiais_estudo.id"), nullable=True
    )
    diagnostico: Mapped[str] = mapped_column(Text, nullable=False)
    total_questoes: Mapped[int] = mapped_column(Integer, nullable=False)
    total_acertos: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )