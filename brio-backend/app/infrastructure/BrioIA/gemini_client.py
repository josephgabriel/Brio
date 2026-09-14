from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from app.infrastructure.config import settings


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


def gerar_questoes(texto_material: str, quantidade: int = 5) -> list[QuestaoGeradaSchema]:
    prompt = (
        f"Com base no texto de estudo a seguir, gere exatamente {quantidade} questões de "
        "múltipla escolha (4 alternativas, A a D), no estilo de bancas de concursos e "
        "vestibulares brasileiros. As questões devem testar compreensão real do conteúdo, "
        "não memorização literal de frases soltas. Para cada questão, inclua uma explicação "
        "curta e didática da resposta correta.\n\n"
        f"TEXTO:\n{texto_material}"
    )

    resposta = _cliente().models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ListaQuestoesSchema,
        ),
    )

    dados = ListaQuestoesSchema.model_validate_json(resposta.text)
    return dados.questoes


def gerar_diagnostico(resumo_desempenho: str) -> str:
    prompt = (
        "Você é um tutor de estudos para concursos e vestibulares brasileiros. Com base no "
        "resumo de desempenho do aluno abaixo, escreva um diagnóstico curto (3 a 5 frases), "
        "destacando o que ele já domina, o que precisa reforçar, e uma sugestão prática de "
        "próximo passo. Tom direto e encorajador, sem jargão técnico.\n\n"
        f"{resumo_desempenho}"
    )

    resposta = _cliente().models.generate_content(model=settings.gemini_model, contents=prompt)
    return resposta.text