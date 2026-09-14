from datetime import date

from app.application.interfaces.ia_repository import MaterialEstudoRepository, QuestaoRepository
from app.domain.exceptions import ArquivoInvalidoError, CotaIAExcedidaError
from app.domain.regras.cota_ia import cota_disponivel
from app.infrastructure.config import settings
from app.infrastructure.BrioIA.gemini_client import gerar_questoes
from app.infrastructure.BrioIA.pdf_extrator import extrair_texto_pdf
from app.infrastructure.db.models.material_estudo import MaterialEstudoModel
from app.infrastructure.db.models.questao import QuestaoModel


class GerarQuestoesIA:
    def __init__(
        self,
        material_repository: MaterialEstudoRepository,
        questao_repository: QuestaoRepository,
    ) -> None:
        self.material_repository = material_repository
        self.questao_repository = questao_repository

    def executar(
        self,
        usuario_id: int,
        nome_arquivo: str,
        conteudo_pdf: bytes,
        topico_id: int | None = None,
        quantidade: int = 5,
    ) -> tuple[MaterialEstudoModel, list[QuestaoModel]]:
        hoje = date.today()
        inicio_do_mes = hoje.replace(day=1)
        usadas = self.material_repository.contar_no_mes(usuario_id, inicio_do_mes)

        if not cota_disponivel(usadas, settings.gemini_cota_mensal):
            raise CotaIAExcedidaError(
                f"Você atingiu o limite de {settings.gemini_cota_mensal} gerações "
                "de questões deste mês. Sua cota renova no próximo mês."
            )

        texto = extrair_texto_pdf(conteudo_pdf)
        if not texto.strip():
            raise ArquivoInvalidoError(
                "Não foi possível extrair texto deste PDF (pode ser um PDF escaneado/imagem)"
            )

        material = self.material_repository.criar(
            MaterialEstudoModel(
                usuario_id=usuario_id, topico_id=topico_id, nome_arquivo=nome_arquivo
            )
        )

        questoes_geradas = gerar_questoes(texto, quantidade)
        questoes_modelo = [
            QuestaoModel(
                material_id=material.id,
                enunciado=q.enunciado,
                alternativas=q.alternativas.model_dump(),
                resposta_correta=q.resposta_correta,
                explicacao=q.explicacao,
            )
            for q in questoes_geradas
        ]
        questoes_salvas = self.questao_repository.criar_varias(questoes_modelo)

        return material, questoes_salvas