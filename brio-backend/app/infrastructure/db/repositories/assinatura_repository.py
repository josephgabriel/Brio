from sqlalchemy.orm import Session

from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.infrastructure.db.models.assinatura import AssinaturaModel


class SQLAlchemyAssinaturaRepository(AssinaturaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, assinatura: AssinaturaModel) -> AssinaturaModel:
        self.db.add(assinatura)
        self.db.commit()
        self.db.refresh(assinatura)
        return assinatura

    def buscar_por_usuario(self, usuario_id: int) -> AssinaturaModel | None:
        return (
            self.db.query(AssinaturaModel)
            .filter(AssinaturaModel.usuario_id == usuario_id)
            .first()
        )

    def buscar_por_preapproval_id(self, preapproval_id: str) -> AssinaturaModel | None:
        return (
            self.db.query(AssinaturaModel)
            .filter(AssinaturaModel.mercadopago_preapproval_id == preapproval_id)
            .first()
        )

    def atualizar(self, assinatura: AssinaturaModel) -> AssinaturaModel:
        self.db.commit()
        self.db.refresh(assinatura)
        return assinatura