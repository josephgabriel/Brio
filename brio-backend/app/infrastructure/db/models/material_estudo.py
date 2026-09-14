from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class MaterialEstudoModel(Base):
    """
    Representa um PDF enviado pelo usuário para gerar questões. Cada
    upload = uma linha aqui = uma "geração" contada na cota mensal.
    """

    __tablename__ = "materiais_estudo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    topico_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("topicos.id"), nullable=True
    )
    nome_arquivo: Mapped[str] = mapped_column(String(200), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )