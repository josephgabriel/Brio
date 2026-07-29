from abc import ABC, abstractmethod

from app.infrastructure.db.models.usuario import UsuarioModel

class UsuarioRepository(ABC):
    @abstractmethod
    def buscar_por_email(self, email: str) -> UsuarioModel | None:
        ...
    def criar(self, usuario: UsuarioModel) -> UsuarioModel:
        ...
    def atualizar(self, usuario: UsuarioModel) -> UsuarioModel: 
        ...