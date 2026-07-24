from sqlalchemy.orm import Session

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.infrastructure.db.models.disciplina import DisciplinaModel


class SQLAlchemyDisciplinaRepository(DisciplinaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, disciplina: DisciplinaModel) -> DisciplinaModel:
        self.db.add(disciplina)
        self.db.commit()
        self.db.refresh(disciplina)
        return disciplina

    def buscar_por_id(self, disciplina_id: int) -> DisciplinaModel | None:
        return (
            self.db.query(DisciplinaModel)
            .filter(DisciplinaModel.id == disciplina_id)
            .first()
        )

    def listar_por_prova(self, prova_id: int) -> list[DisciplinaModel]:
        return (
            self.db.query(DisciplinaModel)
            .filter(DisciplinaModel.prova_id == prova_id)
            .order_by(DisciplinaModel.nome.asc())
            .all()
        )

    def atualizar(self, disciplina: DisciplinaModel) -> DisciplinaModel:
        self.db.commit()
        self.db.refresh(disciplina)
        return disciplina

    def deletar(self, disciplina: DisciplinaModel) -> None:
        self.db.delete(disciplina)
        self.db.commit()