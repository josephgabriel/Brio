from weasyprint import HTML

ESTILO_PDF = """
<style>
    body { font-family: sans-serif; padding: 40px; color: #17181B; line-height: 1.6; }
    .cabecalho { display: flex; align-items: center; gap: 8px; margin-bottom: 28px;
                 padding-bottom: 12px; border-bottom: 2px solid #10B981; }
    .logo-brio { font-size: 18px; font-weight: 800; color: #10B981; letter-spacing: -0.5px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitulo { color: ##0c9467; font-size: 13px; margin-bottom: 24px; }
    img { max-width: 100%; border-radius: 6px; margin: 8px 0; }
    mark { padding: 0 2px; }
    ul, ol { padding-left: 20px; }
</style>
"""


def gerar_pdf_anotacao(titulo: str, subtitulo: str, conteudo_html: str) -> bytes:
    html_completo = f"""
    <html>
      <head>{ESTILO_PDF}</head>
      <body>
        <div class="cabecalho">
          <span class="logo-brio">Brio</span>
        </div>
        <h1>{titulo}</h1>
        <p class="subtitulo">{subtitulo}</p>
        {conteudo_html}
      </body>
    </html>
    """
    return HTML(string=html_completo).write_pdf()