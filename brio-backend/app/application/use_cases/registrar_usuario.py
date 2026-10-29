from app.application.interfaces.usuario_repository import UsuarioRepository
from app.domain.exceptions import EmailJaCadastradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.security.hashing import hash_senha
from datetime import datetime, timezone

class RegistrarUsuario:
    def __init__(self, repository: UsuarioRepository) -> None:
        self.repository = repository

    def executar(self, nome: str, email: str, senha: str, termos_versao: str) -> UsuarioModel:
        if self.repository.buscar_por_email(email) is not None:
            raise EmailJaCadastradoError(f"Já existe um usuário com o email {email}")

        usuario = UsuarioModel(nome=nome, email=email, senha_hash=hash_senha(senha), termos_aceitos_em=datetime.now(timezone.utc),termos_versao=termos_versao,)
        return self.repository.criar(usuario)