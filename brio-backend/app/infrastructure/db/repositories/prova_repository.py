from sqlalchemy.orm import Session

from app.application.interfaces.prova_repository import ProvaRepository
from app.infrastructure.db.models.prova import ProvaModel

class SQLAlchemyProvaRepository(ProvaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, prova: ProvaModel) -> ProvaModel:
        self.db.add(prova)
        self.db.commit()
        self.db.refresh(prova)
        return prova
    
    def listar_por_usuario(self, usuario_id: int) -> list[ProvaModel]:
        return (
            self.db.query(ProvaModel)
            .filter(ProvaModel.usuario_id == usuario_id)
            .order_by(ProvaModel.data_prova.asc())
            .all()
        )
    
    def buscar_por_id(self, prova_id: int) -> ProvaModel | None:
        return self.db.query(ProvaModel).filter(ProvaModel.id == prova_id).first()

    def atualizar(self, prova: ProvaModel) -> ProvaModel:
        self.db.commit()
        self.db.refresh(prova)
        return prova
    
    def deletar(self, prova: ProvaModel) -> None:
        self.db.delete(prova)
        self.db.commit()
