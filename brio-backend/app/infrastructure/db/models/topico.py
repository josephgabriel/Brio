from datetime import datetime
from typing import List

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.session import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.infrastructure.db.models.anotacao import AnotacaoModel
    from app.infrastructure.db.models.revisao import RevisaoModel


class TopicoModel(Base):
    __tablename__ = "topicos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    disciplina_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("disciplinas.id"), nullable=False, index=True
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    criada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    concluido: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    concluido_em: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relacionamentos com deleção em cascata no ORM:
    revisoes: Mapped[List["RevisaoModel"]] = relationship(
        "RevisaoModel",back_populates="topico", cascade="all, delete-orphan"
    )
    anotacoes: Mapped[List["AnotacaoModel"]] = relationship(
        "AnotacaoModel", back_populates="topico", cascade="all, delete-orphan"
    )