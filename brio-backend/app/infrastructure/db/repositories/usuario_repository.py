from sqlalchemy.orm import Session

from app.application.interfaces.usuario_repository import UsuarioRepository
from app.infrastructure.db.models.usuario import UsuarioModel


class SQLAlchemyUsuarioRepository(UsuarioRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def buscar_por_email(self, email: str) -> UsuarioModel | None:
        return self.db.query(UsuarioModel).filter(UsuarioModel.email == email).first()

    def criar(self, usuario: UsuarioModel) -> UsuarioModel:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario