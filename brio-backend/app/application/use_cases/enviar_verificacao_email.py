from app.domain.exceptions import ReenvioMuitoRecenteError
from app.infrastructure.config import settings
from app.infrastructure.email.email_sender import EmailSender
from app.infrastructure.email.limitador_reenvio import pode_reenviar, registrar_envio
from app.infrastructure.security.tokens_acao import criar_token_acao
from app.infrastructure.db.models.usuario import UsuarioModel


class EnviarVerificacaoEmail:
    def __init__(self, email_sender: EmailSender) -> None:
        self.email_sender = email_sender

    def executar(self, usuario: UsuarioModel, ignorar_cooldown: bool = False) -> None:
        chave = f"verificacao:{usuario.email}"
        if not ignorar_cooldown and not pode_reenviar(chave):
            raise ReenvioMuitoRecenteError("Aguarde um momento antes de solicitar outro email")

        token = criar_token_acao(
            usuario.email, "verificar_email", settings.email_verificacao_expira_horas * 60
        )
        link = f"{settings.frontend_url}/verificar-email?token={token}"

        self.email_sender.enviar(
            destinatario=usuario.email,
            assunto="Confirme seu email no Brio",
            corpo_texto=(
                f"Olá, {usuario.nome}!\n\n"
                f"Clique no link abaixo para confirmar seu email:\n{link}\n\n"
                f"Esse link expira em {settings.email_verificacao_expira_horas} horas."
            ),
        )
        registrar_envio(chave)