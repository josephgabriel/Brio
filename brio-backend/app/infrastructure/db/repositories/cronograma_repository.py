# app/infrastructure/db/repositories/cronograma_repository.py
from sqlalchemy.orm import Session

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.infrastructure.db.models.cronograma import CronogramaModel


class SQLAlchemyCronogramaRepository(CronogramaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, item: CronogramaModel) -> CronogramaModel:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def buscar_por_id(self, item_id: int) -> CronogramaModel | None:
        return (
            self.db.query(CronogramaModel).filter(CronogramaModel.id == item_id).first()
        )

    def listar_por_usuario(self, usuario_id: int) -> list[CronogramaModel]:
        return (
            self.db.query(CronogramaModel)
            .filter(CronogramaModel.usuario_id == usuario_id)
            .order_by(CronogramaModel.dia_semana.asc(), CronogramaModel.horario_inicio.asc())
            .all()
        )

    def atualizar(self, item: CronogramaModel) -> CronogramaModel:
        self.db.commit()
        self.db.refresh(item)
        return item

    def deletar(self, item: CronogramaModel) -> None:
        self.db.delete(item)
        self.db.commit()