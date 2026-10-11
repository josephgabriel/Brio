from sqlalchemy.orm import Session
from app.application.interfaces.anotacao_repository import AnotacaoRepository
from app.infrastructure.db.models.anotacao import AnotacaoModel

from datetime import datetime

from sqlalchemy import func

from app.infrastructure.db.models.anotacao_versao import AnotacaoVersaoModel

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
    
    def criar_versao(self, anotacao_id: int, conteudo_html: str) -> None:
        self.db.add(AnotacaoVersaoModel(anotacao_id=anotacao_id, conteudo_html=conteudo_html))
        self.db.commit()

    def data_ultima_versao(self, anotacao_id: int) -> datetime | None:
        return (
            self.db.query(func.max(AnotacaoVersaoModel.criado_em))
            .filter(AnotacaoVersaoModel.anotacao_id == anotacao_id)
            .scalar()
        )

    def podar_versoes(self, anotacao_id: int, manter: int) -> None:
        ids_manter = [
            linha[0]
            for linha in self.db.query(AnotacaoVersaoModel.id)
            .filter(AnotacaoVersaoModel.anotacao_id == anotacao_id)
            .order_by(AnotacaoVersaoModel.criado_em.desc())
            .limit(manter)
            .all()
        ]
        self.db.query(AnotacaoVersaoModel).filter(
            AnotacaoVersaoModel.anotacao_id == anotacao_id,
            ~AnotacaoVersaoModel.id.in_(ids_manter),
        ).delete(synchronize_session=False)
        self.db.commit()
    