from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class CronogramaConclusaoModel(Base):
    __tablename__ = "cronograma_conclusoes"
    __table_args__ = (
        UniqueConstraint("cronograma_id", "data", name="uq_cronograma_conclusao_item_data"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cronograma_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cronograma.id", ondelete="CASCADE"), nullable=False, index=True
    )
    data: Mapped[date] = mapped_column(Date, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )