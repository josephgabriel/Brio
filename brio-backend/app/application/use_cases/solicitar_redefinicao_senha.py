from app.application.interfaces.usuario_repository import UsuarioRepository
from app.infrastructure.config import settings
from app.infrastructure.email.email_sender import EmailSender
from app.infrastructure.security.tokens_acao import criar_token_acao


class SolicitarRedefinicaoSenha:
    def __init__(self, repository: UsuarioRepository, email_sender: EmailSender) -> None:
        self.repository = repository
        self.email_sender = email_sender

    def executar(self, email: str) -> None:
        usuario = self.repository.buscar_por_email(email)
        if usuario is None:
            return

        token = criar_token_acao(
            usuario.email,
            "redefinir_senha",
            settings.redefinicao_senha_expira_minutos,
        )
        link = f"{settings.frontend_url}/redefinir-senha?token={token}"

        self.email_sender.enviar(
            destinatario=usuario.email,
            assunto="Redefinição de senha — Brio",
            corpo_texto=(
                f"Olá, {usuario.nome}!\n\n"
                f"Clique no link abaixo para redefinir sua senha:\n{link}\n\n"
                f"Esse link expira em {settings.redefinicao_senha_expira_minutos} minutos. "
                f"Se você não solicitou isso, ignore este email."
            ),
        )