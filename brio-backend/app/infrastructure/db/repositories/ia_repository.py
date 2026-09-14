from datetime import date

from sqlalchemy.orm import Session

from app.application.interfaces.ia_repository import (
    AvaliacaoDesempenhoRepository,
    HistoricoRespostaRepository,
    MaterialEstudoRepository,
    QuestaoRepository,
)
from app.infrastructure.db.models.avaliacao_desempenho import AvaliacaoDesempenhoModel
from app.infrastructure.db.models.historico_resposta import HistoricoRespostaModel
from app.infrastructure.db.models.material_estudo import MaterialEstudoModel
from app.infrastructure.db.models.questao import QuestaoModel


class SQLAlchemyMaterialEstudoRepository(MaterialEstudoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, material: MaterialEstudoModel) -> MaterialEstudoModel:
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def buscar_por_id(self, material_id: int) -> MaterialEstudoModel | None:
        return (
            self.db.query(MaterialEstudoModel)
            .filter(MaterialEstudoModel.id == material_id)
            .first()
        )

    def contar_no_mes(self, usuario_id: int, inicio_do_mes: date) -> int:
        return (
            self.db.query(MaterialEstudoModel)
            .filter(MaterialEstudoModel.usuario_id == usuario_id)
            .filter(MaterialEstudoModel.criado_em >= inicio_do_mes)
            .count()
        )


class SQLAlchemyQuestaoRepository(QuestaoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar_varias(self, questoes: list[QuestaoModel]) -> list[QuestaoModel]:
        self.db.add_all(questoes)
        self.db.commit()
        for questao in questoes:
            self.db.refresh(questao)
        return questoes

    def buscar_por_id(self, questao_id: int) -> QuestaoModel | None:
        return self.db.query(QuestaoModel).filter(QuestaoModel.id == questao_id).first()

    def listar_por_material(self, material_id: int) -> list[QuestaoModel]:
        return (
            self.db.query(QuestaoModel).filter(QuestaoModel.material_id == material_id).all()
        )


class SQLAlchemyHistoricoRespostaRepository(HistoricoRespostaRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, historico: HistoricoRespostaModel) -> HistoricoRespostaModel:
        self.db.add(historico)
        self.db.commit()
        self.db.refresh(historico)
        return historico

    def listar_por_questoes(
        self, usuario_id: int, questoes_ids: list[int]
    ) -> list[HistoricoRespostaModel]:
        return (
            self.db.query(HistoricoRespostaModel)
            .filter(HistoricoRespostaModel.usuario_id == usuario_id)
            .filter(HistoricoRespostaModel.questao_id.in_(questoes_ids))
            .all()
        )


class SQLAlchemyAvaliacaoDesempenhoRepository(AvaliacaoDesempenhoRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def criar(self, avaliacao: AvaliacaoDesempenhoModel) -> AvaliacaoDesempenhoModel:
        self.db.add(avaliacao)
        self.db.commit()
        self.db.refresh(avaliacao)
        return avaliacao