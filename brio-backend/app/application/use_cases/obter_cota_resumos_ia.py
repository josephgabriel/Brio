from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.application.use_cases.obter_cota_ia import CotaIA
from app.domain.regras.tempo import hoje_local
from app.infrastructure.config import settings


class ObterCotaResumosIA:
    def __init__(self, repository: ResumoIARepository) -> None:
        self.repository = repository

    def executar(self, usuario_id: int) -> CotaIA:
        inicio_do_mes = hoje_local().replace(day=1)
        usadas = self.repository.contar_no_mes(usuario_id, inicio_do_mes)
        return CotaIA(usadas=usadas, limite=settings.gemini_cota_resumos_mensal)