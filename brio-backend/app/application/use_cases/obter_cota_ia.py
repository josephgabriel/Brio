from dataclasses import dataclass
from datetime import date

from app.application.interfaces.ia_repository import MaterialEstudoRepository
from app.infrastructure.config import settings


@dataclass
class CotaIA:
    usadas: int
    limite: int


class ObterCotaIA:
    def __init__(self, repository: MaterialEstudoRepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> CotaIA:
        hoje = date.today()
        inicio_do_mes = hoje.replace(day=1)
        usadas = self.repository.contar_no_mes(usuario_id, inicio_do_mes)
        return CotaIA(usadas=usadas, limite=settings.gemini_cota_mensal)