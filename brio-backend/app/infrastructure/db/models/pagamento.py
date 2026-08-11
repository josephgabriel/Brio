from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class PagamentoModel(Base):
    __tablename__ = "pagamentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assinatura_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assinaturas.id"), nullable=False, index=True
    )
    mercadopago_payment_id: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )
    valor: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )