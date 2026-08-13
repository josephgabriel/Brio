# app/application/use_cases/criar_evento.py
from datetime import date

from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.infrastructure.db.models.evento_calendario import EventoCalendarioModel, TipoEvento


class CriarEvento:
    def __init__(self, repository: EventoCalendarioRepository) -> None:
        self.repository = repository

    def executar(
        self,
        usuario_id: int,
        titulo: str,
        data: date,
        tipo: TipoEvento = TipoEvento.EVENTO,
        descricao: str | None = None,
    ) -> EventoCalendarioModel:
        evento = EventoCalendarioModel(
            usuario_id=usuario_id, titulo=titulo, data=data, tipo=tipo, descricao=descricao
        )
        return self.repository.criar(evento)