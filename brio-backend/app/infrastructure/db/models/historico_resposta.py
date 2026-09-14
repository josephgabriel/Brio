from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class HistoricoRespostaModel(Base):
    __tablename__ = "historico_respostas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    questao_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questoes.id"), nullable=False, index=True
    )
    alternativa_selecionada: Mapped[str] = mapped_column(String(1), nullable=False)
    acertou: Mapped[bool] = mapped_column(Boolean, nullable=False)
    respondido_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )