from sqlalchemy.orm import Session
from app.application.interfaces.anotacao_repository import AnotacaoRepository
from app.infrastructure.db.models.anotacao import AnotacaoModel

class SQLAlchemyAnotacaoRepository(AnotacaoRepository):
    def __init__ (self, db: Session) -> None:
        self.db = db

    def buscar_por_topico(self, topico_id: int) -> AnotacaoModel | None:
        return (
            self.db.query(AnotacaoModel)
            .filter(AnotacaoModel.topico_id == topico_id)
            .first()
        )
    
    def salvar(self, anotacao: AnotacaoModel) -> AnotacaoModel:
        self.db.add(anotacao)
        self.db.commit()
        self.db.refresh(anotacao)
        return anotacao
    