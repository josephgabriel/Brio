from io import BytesIO

from pypdf import PdfReader

LIMITE_CARACTERES = 8000  # ~2.000 tokens (controlar custo de entrada)


def extrair_texto_pdf(conteudo_arquivo: bytes) -> str:
    leitor = PdfReader(BytesIO(conteudo_arquivo))
    texto = "\n".join(pagina.extract_text() or "" for pagina in leitor.pages)
    return texto[:LIMITE_CARACTERES]

"""[:LIMITE_CARACTERES] é a peça central de controle de custo — 
não importa se o PDF tem 2 ou 200 
páginas, só as primeiras ~8.000 caracteres de texto extraído são mandados pro Gemini.
 PDFs maiores simplesmente geram questões só sobre o início do conteúdo 
 (registrado como melhoria futura: deixar o usuário escolher o intervalo de páginas)."""