# app/infrastructure/db/repositories/evento_calendario_repository.py
from datetime import date

from sqlalchemy.orm import Session

from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.infrastructure.db.models.evento_calendario import EventoCalendarioModel


class SQLAlchemyEventoCalendarioRepository(EventoCalendarioRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, evento: EventoCalendarioModel) -> EventoCalendarioModel:
        self.db.add(evento)
        self.db.commit()
        self.db.refresh(evento)
        return evento

    def buscar_por_id(self, evento_id: int) -> EventoCalendarioModel | None:
        return (
            self.db.query(EventoCalendarioModel)
            .filter(EventoCalendarioModel.id == evento_id)
            .first()
        )

    def listar_por_periodo(
        self, usuario_id: int, data_inicio: date, data_fim: date
    ) -> list[EventoCalendarioModel]:
        return (
            self.db.query(EventoCalendarioModel)
            .filter(EventoCalendarioModel.usuario_id == usuario_id)
            .filter(EventoCalendarioModel.data >= data_inicio)
            .filter(EventoCalendarioModel.data <= data_fim)
            .order_by(EventoCalendarioModel.data.asc())
            .all()
        )

    def atualizar(self, evento: EventoCalendarioModel) -> EventoCalendarioModel:
        self.db.commit()
        self.db.refresh(evento)
        return evento

    def deletar(self, evento: EventoCalendarioModel) -> None:
        self.db.delete(evento)
        self.db.commit()