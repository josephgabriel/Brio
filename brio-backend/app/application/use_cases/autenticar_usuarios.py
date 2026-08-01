from app.application.interfaces.usuario_repository import UsuarioRepository
from app.domain.exceptions import CredenciaisInvalidasError, EmailNaoVerificadoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.security.hashing import verificar_senha

class AutenticarUsuario:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def executar(self, email: str, senha: str) -> UsuarioModel:
        usuario = self.repository.buscar_por_email(email)

        if usuario is None or not verificar_senha(senha, usuario.senha_hash):
            raise CredenciaisInvalidasError("Email ou senha incorretos")
        
        if not usuario.email_verificado:
            raise EmailNaoVerificadoError()
        
        return usuario