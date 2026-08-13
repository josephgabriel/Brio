# app/application/use_cases/atualizar_evento.py
from datetime import date

from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.domain.exceptions import EventoNaoEncontradoError
from app.infrastructure.db.models.evento_calendario import EventoCalendarioModel, TipoEvento


class AtualizarEvento:
    def __init__(self, repository: EventoCalendarioRepository) -> None:
        self.repository = repository

    def executar(
        self,
        evento_id: int,
        usuario_id: int,
        titulo: str | None = None,
        descricao: str | None = None,
        data: date | None = None,
        tipo: TipoEvento | None = None,
        concluido: bool | None = None,
    ) -> EventoCalendarioModel:
        evento = self.repository.buscar_por_id(evento_id)
        if evento is None or evento.usuario_id != usuario_id:
            raise EventoNaoEncontradoError(f"Evento {evento_id} não encontrado")

        if titulo is not None:
            evento.titulo = titulo
        if descricao is not None:
            evento.descricao = descricao
        if data is not None:
            evento.data = data
        if tipo is not None:
            evento.tipo = tipo
        if concluido is not None:
            evento.concluido = concluido

        return self.repository.atualizar(evento)