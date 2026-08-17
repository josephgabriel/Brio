from weasyprint import HTML

ESTILO_PDF = """
<style>
    body { font-family: sans-serif; padding: 40px; color: #17181B; line-height: 1.6; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitulo { color: #6B6D76; font-size: 13px; margin-bottom: 24px; }
    img { max-width: 100%; border-radius: 6px; margin: 8px 0; }
    mark { padding: 0 2px; }
    ul, ol { padding-left: 20px; }
</style>
"""


def gerar_pdf_anotacao(titulo: str, subtitulo: str, conteudo_html: str) -> bytes:
    """
    Monta um documento HTML simples (título + conteúdo da anotação) e
    converte pra PDF. O WeasyPrint entende HTML+CSS "de verdade" --
    negrito, cores, imagens (via URL) e listas do Tiptap são
    renderizados corretamente sem tratamento especial.
    """
    html_completo = f"""
    <html>
      <head>{ESTILO_PDF}</head>
      <body>
        <h1>{titulo}</h1>
        <p class="subtitulo">{subtitulo}</p>
        {conteudo_html}
      </body>
    </html>
    """
    return HTML(string=html_completo).write_pdf()