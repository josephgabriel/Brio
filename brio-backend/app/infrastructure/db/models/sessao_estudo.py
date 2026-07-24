from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class SessaoEstudoModel(Base):
    __tablename__ = "sessoes_estudo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    prova_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("provas.id"), nullable=False, index=True
    )

    disciplina_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("disciplinas.id"), nullable=True, index=True
    )
    topico_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("topicos.id"), nullable=True, index=True
    )

    disciplina: Mapped[str] = mapped_column(String(200), nullable=False)
    assunto: Mapped[str] = mapped_column(String(200), nullable=False)
    objetivo: Mapped[str | None] = mapped_column(String(500))

    iniciada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    finalizada_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duracao_minutos: Mapped[int | None] = mapped_column(Integer)

    concentracao: Mapped[int | None] = mapped_column(Integer)
    dificuldade: Mapped[int | None] = mapped_column(Integer)
    aprendizado_percentual: Mapped[int | None] = mapped_column(Integer)