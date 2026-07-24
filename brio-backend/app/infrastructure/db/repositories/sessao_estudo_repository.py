from sqlalchemy.orm import Session

from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class SQLAlchemySessaoEstudoRepository(SessaoEstudoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, sessao: SessaoEstudoModel) -> SessaoEstudoModel:
        self.db.add(sessao)
        self.db.commit()
        self.db.refresh(sessao)
        return sessao

    def buscar_por_id(self, sessao_id: int) -> SessaoEstudoModel | None:
        return (
            self.db.query(SessaoEstudoModel)
            .filter(SessaoEstudoModel.id == sessao_id)
            .first()
        )

    def listar_por_usuario(
        self, usuario_id: int, prova_id: int | None = None
    ) -> list[SessaoEstudoModel]:
        query = self.db.query(SessaoEstudoModel).filter(
            SessaoEstudoModel.usuario_id == usuario_id
        )
        if prova_id is not None:
            query = query.filter(SessaoEstudoModel.prova_id == prova_id)
        return query.order_by(SessaoEstudoModel.iniciada_em.desc()).all()

    def atualizar(self, sessao: SessaoEstudoModel) -> SessaoEstudoModel:
        self.db.commit()
        self.db.refresh(sessao)
        return sessao
    
    def deletar(self, sessao: SessaoEstudoModel) -> None:
        self.db.delete(sessao)
        self.db.commit()