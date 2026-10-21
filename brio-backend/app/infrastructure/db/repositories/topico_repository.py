from sqlalchemy.orm import Session

from app.application.interfaces.topico_repository import TopicoRepository
from app.infrastructure.db.models.topico import TopicoModel
from sqlalchemy import case, func

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

    def atualizar(self, topico: TopicoModel) -> TopicoModel:
        self.db.commit()
        self.db.refresh(topico)
        return topico
    
    def contar_por_disciplinas(
        self, disciplina_ids: list[int]
    ) -> dict[int, tuple[int, int]]:
        if not disciplina_ids:
            return {}

        linhas = (
            self.db.query(
                TopicoModel.disciplina_id,
                func.count(TopicoModel.id),
                func.sum(case((TopicoModel.concluido.is_(True), 1), else_=0)),
            )
            .filter(TopicoModel.disciplina_id.in_(disciplina_ids))
            .group_by(TopicoModel.disciplina_id)
            .all()
        )
        return {
            disciplina_id: (int(total), int(concluidos or 0))
            for disciplina_id, total, concluidos in linhas
        }