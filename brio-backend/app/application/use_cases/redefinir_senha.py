from app.application.interfaces.usuario_repository import UsuarioRepository
from app.domain.exceptions import TokenInvalidoError
from app.infrastructure.security.hashing import hash_senha
from app.infrastructure.security.tokens_acao import decodificar_token_acao


class RedefinirSenha:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def executar(self, token: str, nova_senha: str) -> None:
        email = decodificar_token_acao(token, "redefinir_senha")
        if email is None:
            raise TokenInvalidoError("Link de redefinição inválido ou expirado")

        usuario = self.repository.buscar_por_email(email)
        if usuario is None:
            raise TokenInvalidoError("Link de redefinição inválido ou expirado")

        usuario.senha_hash = hash_senha(nova_senha)
        self.repository.atualizar(usuario)