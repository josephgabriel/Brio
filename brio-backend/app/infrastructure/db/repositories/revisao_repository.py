from datetime import date

from sqlalchemy.orm import Session

from app.application.interfaces.revisao_repository import RevisaoRepository
from app.infrastructure.db.models.revisao import RevisaoModel

class SQLAlchemyRevisaoRepository(RevisaoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar_varias(self, revisoes: list[RevisaoModel]) -> list[RevisaoModel]:
        self.db.add_all(revisoes)
        self.db.commit()
        for revisao in revisoes:
            self.db.refresh(revisao)

        return
    
    def buscar_por_id(self, revisao_id: int) -> RevisaoModel | None:
        return self.db.query(RevisaoModel).filter(RevisaoModel.id == revisao_id).first()
    
    def listar_por_usuario(
        self,
        usuario_id: int,
        prova_id: int | None = None,
        apenas_pendentes: bool = False,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[RevisaoModel]:
        query = self.db.query(RevisaoModel).filter(RevisaoModel.usuario_id == usuario_id)

        if prova_id is not None:
            query = query.filter(RevisaoModel.prova_id == prova_id)
        if apenas_pendentes:
            query = query.filter(RevisaoModel.concluida_em.is_(None))
        if data_inicio is not None:
            query = query.filter(RevisaoModel.data_agendada >= data_inicio)
        if data_fim is not None:
            query = query.filter(RevisaoModel.data_agendada <= data_fim)

        return query.order_by(RevisaoModel.data_agendada.asc()).all()
    
    def listar_ate_data(self, usuario_id: int, data_limite: date) -> list[RevisaoModel]:
        return (
            self.db.query(RevisaoModel)
            .filter(RevisaoModel.usuario_id == usuario_id)
            .filter(RevisaoModel.concluida_em.is_(None))
            .filter(RevisaoModel.data_agendada <= data_limite)
            .order_by(RevisaoModel.data_agendada.asc())
            .all()
        )
    
    def atualizar(self, revisao: RevisaoModel) -> RevisaoModel:
        self.db.commit()
        self.db.refresh(revisao)
        return revisao