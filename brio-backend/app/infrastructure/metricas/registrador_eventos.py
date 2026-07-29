from sqlalchemy.orm import Session

from app.infrastructure.db.models.evento_metrica import EventoMetricaModel


class RegistradorEventos:
    """
    Serviço simples (não é um repositório de domínio completo, de
    propósito) que só grava eventos -- usado como uma "dependency"
    injetada nos routers, chamada em paralelo à ação principal.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def registrar(self, tipo_evento: str, usuario_id: int | None = None) -> None:
        evento = EventoMetricaModel(tipo_evento=tipo_evento, usuario_id=usuario_id)
        self.db.add(evento)
        self.db.commit()