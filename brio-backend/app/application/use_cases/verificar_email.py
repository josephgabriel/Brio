from app.application.interfaces.usuario_repository import UsuarioRepository
from app.domain.exceptions import TokenInvalidoError
from app.infrastructure.security.tokens_acao import decodificar_token_acao


class VerificarEmail:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def executar(self, token: str) -> None:
        email = decodificar_token_acao(token, "verificar_email")
        if email is None:
            raise TokenInvalidoError("Link de verificação inválido ou expirado")

        usuario = self.repository.buscar_por_email(email)
        if usuario is None:
            raise TokenInvalidoError("Link de verificação inválido ou expirado")

        usuario.email_verificado = True
        self.repository.atualizar(usuario)