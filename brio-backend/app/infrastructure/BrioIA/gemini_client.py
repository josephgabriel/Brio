import logging

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.domain.exceptions import FalhaIAError
from app.infrastructure.config import settings

logger = logging.getLogger(__name__)

MENSAGEM_FALHA = (
    "A IA não conseguiu responder agora. Tente novamente em instantes. "
    "Sua cota não foi consumida."
)


class AlternativasSchema(BaseModel):
    A: str
    B: str
    C: str
    D: str


class QuestaoGeradaSchema(BaseModel):
    enunciado: str
    alternativas: AlternativasSchema
    resposta_correta: str = Field(pattern="^[ABCD]$")
    explicacao: str


class ListaQuestoesSchema(BaseModel):
    questoes: list[QuestaoGeradaSchema]


def _cliente() -> genai.Client:
    return genai.Client(api_key=settings.gemini_api_key)


def gerar_questoes(texto_material: str, quantidade: int) -> list[QuestaoGeradaSchema]:
    prompt = (
        f"Com base no texto de estudo a seguir, gere exatamente {quantidade} questões de "
        "múltipla escolha (4 alternativas, A a D), no estilo de bancas de concursos e "
        "vestibulares brasileiros.\n"
        "Regras:\n"
        "- Teste a compreensão real do conteúdo, não a memorização de frases soltas.\n"
        "- Cubra assuntos diferentes do texto: não repita o mesmo tema em várias questões.\n"
        "- Apenas uma alternativa deve estar correta, e as erradas devem ser plausíveis.\n"
        "- Varie a posição da alternativa correta entre A, B, C e D.\n"
        "- Na explicação, diga por que a resposta correta está certa, sem citar letras.\n"
        "- Use somente informações presentes no texto fornecido.\n\n"
        f"TEXTO:\n{texto_material}"
    )

    try:
        resposta = _cliente().models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ListaQuestoesSchema,
            ),
        )
        dados = ListaQuestoesSchema.model_validate_json(resposta.text)
    except Exception as erro:
        # Na fronteira com um serviço externo não dá para listar tudo que pode falhar.
        # O erro real vai para o log; o usuário recebe uma mensagem clara.
        logger.exception("Falha ao gerar questões com o Gemini")
        raise FalhaIAError(MENSAGEM_FALHA) from erro

    if not dados.questoes:
        raise FalhaIAError(MENSAGEM_FALHA)

    # Se a IA devolver mais do que o pedido, ficamos com o pedido. Se devolver menos, aceitamos.
    return dados.questoes[:quantidade]


def gerar_diagnostico(resumo_desempenho: str) -> str:
    prompt = (
        "Você é um tutor de estudos para concursos e vestibulares brasileiros. Com base no "
        "resumo de desempenho do aluno abaixo, escreva um diagnóstico curto (3 a 5 frases), "
        "destacando o que ele já domina, o que precisa reforçar e uma sugestão prática de "
        "próximo passo. Tom direto e encorajador, sem jargão técnico.\n\n"
        f"{resumo_desempenho}"
    )

    try:
        resposta = _cliente().models.generate_content(
            model=settings.gemini_model, contents=prompt
        )
        texto = (resposta.text or "").strip()
    except Exception as erro:
        logger.exception("Falha ao gerar o diagnóstico com o Gemini")
        raise FalhaIAError(MENSAGEM_FALHA) from erro

    if not texto:
        raise FalhaIAError(MENSAGEM_FALHA)
    return texto