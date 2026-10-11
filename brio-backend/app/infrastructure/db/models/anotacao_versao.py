from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.session import Base


class AnotacaoVersaoModel(Base):
    __tablename__ = "anotacao_versoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    anotacao_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("anotacoes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conteudo_html: Mapped[str] = mapped_column(Text, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )