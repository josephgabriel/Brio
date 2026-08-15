from datetime import datetime, time

from sqlalchemy import DateTime, ForeignKey, Integer, Time, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class CronogramaModel(Base):
    __tablename__ = "cronograma"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id"), nullable=False, index=True
    )
    disciplina_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("disciplinas.id"), nullable=False, index=True
    )
    dia_semana: Mapped[int] = mapped_column(Integer, nullable=False)
    horario_inicio: Mapped[time | None] = mapped_column(Time)
    duracao_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )