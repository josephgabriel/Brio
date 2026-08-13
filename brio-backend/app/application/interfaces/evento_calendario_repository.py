# app/application/interfaces/evento_calendario_repository.py
from abc import ABC, abstractmethod
from datetime import date

from app.infrastructure.db.models.evento_calendario import EventoCalendarioModel


class EventoCalendarioRepository(ABC):
    @abstractmethod
    def criar(self, evento: EventoCalendarioModel) -> EventoCalendarioModel: ...

    @abstractmethod
    def buscar_por_id(self, evento_id: int) -> EventoCalendarioModel | None: ...

    @abstractmethod
    def listar_por_periodo(
        self, usuario_id: int, data_inicio: date, data_fim: date
    ) -> list[EventoCalendarioModel]: ...

    @abstractmethod
    def atualizar(self, evento: EventoCalendarioModel) -> EventoCalendarioModel: ...

    @abstractmethod
    def deletar(self, evento: EventoCalendarioModel) -> None: ...