from sqlalchemy.orm import Session

from app.application.interfaces.topico_repository import TopicoRepository
from app.infrastructure.db.models.topico import TopicoModel


class SQLAlchemyTopicoRepository(TopicoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, topico: TopicoModel) -> TopicoModel:
        self.db.add(topico)
        self.db.commit()
        self.db.refresh(topico)
        return topico

    def buscar_por_id(self, topico_id: int) -> TopicoModel | None:
        return self.db.query(TopicoModel).filter(TopicoModel.id == topico_id).first()

    def listar_por_disciplina(self, disciplina_id: int) -> list[TopicoModel]:
        return (
            self.db.query(TopicoModel)
            .filter(TopicoModel.disciplina_id == disciplina_id)
            .order_by(TopicoModel.nome.asc())
            .all()
        )

    def deletar(self, topico: TopicoModel) -> None:
        self.db.delete(topico)
        self.db.commit()