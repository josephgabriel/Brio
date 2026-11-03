from datetime import date

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.application.interfaces.cronograma_repository import CronogramaRepository
from app.infrastructure.db.models.cronograma import CronogramaModel
from app.infrastructure.db.models.cronograma_conclusao import CronogramaConclusaoModel


class SQLAlchemyCronogramaRepository(CronogramaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, item: CronogramaModel) -> CronogramaModel:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def buscar_por_id(self, item_id: int) -> CronogramaModel | None:
        return self.db.query(CronogramaModel).filter(CronogramaModel.id == item_id).first()

    def listar_por_usuario(self, usuario_id: int) -> list[CronogramaModel]:
        return (
            self.db.query(CronogramaModel)
            .filter(CronogramaModel.usuario_id == usuario_id)
            .order_by(CronogramaModel.dia_semana.asc(), CronogramaModel.horario_inicio.asc())
            .all()
        )

    def atualizar(self, item: CronogramaModel) -> CronogramaModel:
        self.db.commit()
        self.db.refresh(item)
        return item

    def deletar(self, item: CronogramaModel) -> None:
        self.db.delete(item)
        self.db.commit()

    def listar_conclusoes(
        self, item_ids: list[int], data_inicio: date, data_fim: date
    ) -> set[tuple[int, date]]:
        if not item_ids:
            return set()
        linhas = (
            self.db.query(CronogramaConclusaoModel.cronograma_id, CronogramaConclusaoModel.data)
            .filter(CronogramaConclusaoModel.cronograma_id.in_(item_ids))
            .filter(CronogramaConclusaoModel.data >= data_inicio)
            .filter(CronogramaConclusaoModel.data <= data_fim)
            .all()
        )
        return {(item_id, data) for item_id, data in linhas}

    def definir_conclusao(self, item_id: int, data: date, concluido: bool) -> None:
        existente = (
            self.db.query(CronogramaConclusaoModel)
            .filter(
                CronogramaConclusaoModel.cronograma_id == item_id,
                CronogramaConclusaoModel.data == data,
            )
            .first()
        )
        try:
            if concluido and existente is None:
                self.db.add(CronogramaConclusaoModel(cronograma_id=item_id, data=data))
                self.db.commit()
            elif not concluido and existente is not None:
                self.db.delete(existente)
                self.db.commit()
        except IntegrityError:
            # Duas requisições simultâneas tentaram gravar o mesmo dia: o resultado
            # desejado já existe, então basta desfazer a tentativa repetida.
            self.db.rollback()