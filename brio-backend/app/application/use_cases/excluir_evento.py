# app/application/use_cases/excluir_evento.py
from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.domain.exceptions import EventoNaoEncontradoError


class ExcluirEvento:
    def __init__(self, repository: EventoCalendarioRepository) -> None:
        self.repository = repository

    def executar(self, evento_id: int, usuario_id: int) -> None:
        evento = self.repository.buscar_por_id(evento_id)
        if evento is None or evento.usuario_id != usuario_id:
            raise EventoNaoEncontradoError(f"Evento {evento_id} não encontrado")
        self.repository.deletar(evento)