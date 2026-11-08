import logging

from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.domain.exceptions import ArquivoInvalidoError, CotaIAExcedidaError
from app.domain.regras.cota_ia import cota_disponivel
from app.domain.regras.resumo_ia import LIMITE_CARACTERES_PDF
from app.domain.regras.tempo import hoje_local
from app.infrastructure.config import settings
from app.infrastructure.db.models.resumo_ia import ResumoIAModel
from app.infrastructure.BrioIA.gemini_client import gerar_resumo
from app.infrastructure.BrioIA.pdf_extrator import extrair_texto_com_paginas

logger = logging.getLogger(__name__)


class GerarResumoIA:
    def __init__(self, repository: ResumoIARepository) -> None:
        self.repository = repository

    def executar(
        self, usuario_id: int, nome_arquivo: str, conteudo_pdf: bytes, nivel: str
    ) -> ResumoIAModel:
        inicio_do_mes = hoje_local().replace(day=1)
        usadas = self.repository.contar_no_mes(usuario_id, inicio_do_mes)

        if not cota_disponivel(usadas, settings.gemini_cota_resumos_mensal):
            raise CotaIAExcedidaError(
                f"Você atingiu o limite de {settings.gemini_cota_resumos_mensal} resumos "
                "deste mês. Sua cota renova no próximo mês."
            )

        try:
            extraido = extrair_texto_com_paginas(conteudo_pdf, LIMITE_CARACTERES_PDF)
        except Exception as erro:
            # PDF protegido por senha, corrompido ou em formato que a biblioteca não lê
            logger.exception("Falha ao ler o PDF")
            raise ArquivoInvalidoError(
                "Não foi possível ler este PDF. Ele pode estar protegido por senha ou corrompido."
            ) from erro

        if not extraido.texto.strip():
            raise ArquivoInvalidoError(
                "Não foi possível extrair texto deste PDF (pode ser um PDF escaneado, em imagem)"
            )

        # A IA vem ANTES de qualquer gravação: se falhar, nada foi criado e a cota está intacta
        gerado = gerar_resumo(extraido.texto, nivel)

        return self.repository.criar(
            ResumoIAModel(
                usuario_id=usuario_id,
                nome_arquivo=nome_arquivo,
                titulo=gerado.titulo.strip()[:200] or "Resumo",
                nivel=nivel,
                conteudo=gerado.model_dump(),
                paginas_lidas=extraido.paginas_lidas,
                total_paginas=extraido.total_paginas,
            )
        )