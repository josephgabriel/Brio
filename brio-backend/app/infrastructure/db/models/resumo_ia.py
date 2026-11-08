from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class ResumoIAModel(Base):
    __tablename__ = "resumos_ia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    nome_arquivo: Mapped[str] = mapped_column(String(200), nullable=False)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    nivel: Mapped[str] = mapped_column(String(10), nullable=False)
    conteudo: Mapped[dict] = mapped_column(JSON, nullable=False)
    paginas_lidas: Mapped[int] = mapped_column(Integer, nullable=False)
    total_paginas: Mapped[int] = mapped_column(Integer, nullable=False)
    arquivado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )