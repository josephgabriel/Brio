from app.application.interfaces.usuario_repository import UsuarioRepository
from app.domain.exceptions import ReenvioMuitoRecenteError
from app.infrastructure.config import settings
from app.infrastructure.email.email_sender import EmailSender
from app.infrastructure.email.limitador_reenvio import pode_reenviar, registrar_envio
from app.infrastructure.security.tokens_acao import criar_token_acao


def _gerar_template_html(nome: str, link: str, minutos_expiracao: int) -> str:
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de senha — Brio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
          
          <!-- Cabeçalho / Logo -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #10B981; letter-spacing: -0.5px;">Brio</h1>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 16px 32px 32px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #111827; text-align: center;">
                Redefinição de Senha
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                Olá, <strong>{nome}</strong>!
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Brio. Clique no botão abaixo para escolher uma nova senha:
              </p>

              <!-- Botão de Ação -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="{link}" target="_blank" style="display: inline-block; background-color: #10B981; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #6b7280; text-align: center;">
                Este link é válido por <strong>{minutos_expiracao} minutos</strong>.
              </p>

              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />

              <!-- Link alternativo -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af;">
                Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; line-height: 1.4; word-break: break-all;">
                <a href="{link}" style="color: #10B981; text-decoration: underline;">{link}</a>
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Se você não solicitou a alteração de senha, ignore este e-mail com segurança. Sua senha permanecerá a mesma.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


class SolicitarRedefinicaoSenha:
    def __init__(self, repository: UsuarioRepository, email_sender: EmailSender) -> None:
        self.repository = repository
        self.email_sender = email_sender

    def executar(self, email: str) -> None:
        usuario = self.repository.buscar_por_email(email)
        if usuario is None:
            return

        chave = f"redefinicao:{email}"
        if not pode_reenviar(chave):
            raise ReenvioMuitoRecenteError("Aguarde um momento antes de solicitar outro email")

        token = criar_token_acao(
            usuario.email,
            "redefinir_senha",
            settings.redefinicao_senha_expira_minutos,
        )
        link = f"{settings.frontend_url}/redefinir-senha?token={token}"

        corpo_texto = (
            f"Olá, {usuario.nome}!\n\n"
            f"Clique no link abaixo para redefinir sua senha:\n{link}\n\n"
            f"Esse link expira em {settings.redefinicao_senha_expira_minutos} minutos. "
            f"Se você não solicitou isso, ignore este email."
        )

        corpo_html = _gerar_template_html(
            nome=usuario.nome,
            link=link,
            minutos_expiracao=settings.redefinicao_senha_expira_minutos,
        )

        self.email_sender.enviar(
            destinatario=usuario.email,
            assunto="Redefinição de senha — Brio",
            corpo_texto=corpo_texto,
            corpo_html=corpo_html,
        )

        registrar_envio(chave)