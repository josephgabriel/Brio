from dataclasses import dataclass
from io import BytesIO

from pypdf import PdfReader

LIMITE_CARACTERES = 8000  # usado pelas Questões IA


def extrair_texto_pdf(conteudo_arquivo: bytes) -> str:
    leitor = PdfReader(BytesIO(conteudo_arquivo))
    texto = "\n".join(pagina.extract_text() or "" for pagina in leitor.pages)
    return texto[:LIMITE_CARACTERES]


@dataclass(frozen=True)
class TextoExtraido:
    texto: str
    paginas_lidas: int
    total_paginas: int


def extrair_texto_com_paginas(conteudo_arquivo: bytes, limite_caracteres: int) -> TextoExtraido:
    """
    Lê página por página e PARA ao atingir o limite: um PDF de 300 páginas
    não é processado inteiro só para descartar quase tudo.
    """
    leitor = PdfReader(BytesIO(conteudo_arquivo))
    total = len(leitor.pages)

    partes: list[str] = []
    acumulado = 0
    lidas = 0
    for pagina in leitor.pages:
        trecho = pagina.extract_text() or ""
        partes.append(trecho)
        acumulado += len(trecho)
        lidas += 1
        if acumulado >= limite_caracteres:
            break

    return TextoExtraido(
        texto="\n".join(partes)[:limite_caracteres],
        paginas_lidas=lidas,
        total_paginas=total,
    )