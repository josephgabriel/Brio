from datetime import date

from sqlalchemy.orm import Session, defer

from app.application.interfaces.resumo_ia_repository import ResumoIARepository
from app.infrastructure.db.models.resumo_ia import ResumoIAModel


class SQLAlchemyResumoIARepository(ResumoIARepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, resumo: ResumoIAModel) -> ResumoIAModel:
        self.db.add(resumo)
        self.db.commit()
        self.db.refresh(resumo)
        return resumo

    def buscar_por_id(self, resumo_id: int) -> ResumoIAModel | None:
        return self.db.query(ResumoIAModel).filter(ResumoIAModel.id == resumo_id).first()

    def listar_por_usuario(self, usuario_id: int) -> list[ResumoIAModel]:
        # defer: o conteúdo completo não é carregado na lista, só no detalhe
        return (
            self.db.query(ResumoIAModel)
            .options(defer(ResumoIAModel.conteudo))
            .filter(ResumoIAModel.usuario_id == usuario_id)
            .filter(ResumoIAModel.arquivado_em.is_(None))
            .order_by(ResumoIAModel.criado_em.desc(), ResumoIAModel.id.desc())
            .all()
        )

    def contar_no_mes(self, usuario_id: int, inicio_do_mes: date) -> int:
        # Conta TODOS, inclusive os arquivados: arquivar não devolve a geração à cota
        return (
            self.db.query(ResumoIAModel)
            .filter(ResumoIAModel.usuario_id == usuario_id)
            .filter(ResumoIAModel.criado_em >= inicio_do_mes)
            .count()
        )

    def atualizar(self, resumo: ResumoIAModel) -> ResumoIAModel:
        self.db.commit()
        self.db.refresh(resumo)
        return resumo