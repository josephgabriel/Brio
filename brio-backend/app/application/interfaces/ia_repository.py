from abc import ABC, abstractmethod
from datetime import date

from app.infrastructure.db.models.avaliacao_desempenho import AvaliacaoDesempenhoModel
from app.infrastructure.db.models.historico_resposta import HistoricoRespostaModel
from app.infrastructure.db.models.material_estudo import MaterialEstudoModel
from app.infrastructure.db.models.questao import QuestaoModel


class MaterialEstudoRepository(ABC):
    @abstractmethod
    def criar(self, material: MaterialEstudoModel) -> MaterialEstudoModel: ...

    @abstractmethod
    def buscar_por_id(self, material_id: int) -> MaterialEstudoModel | None: ...

    @abstractmethod
    def contar_no_mes(self, usuario_id: int, inicio_do_mes: date) -> int: ...


class QuestaoRepository(ABC):
    @abstractmethod
    def criar_varias(self, questoes: list[QuestaoModel]) -> list[QuestaoModel]: ...

    @abstractmethod
    def buscar_por_id(self, questao_id: int) -> QuestaoModel | None: ...

    @abstractmethod
    def listar_por_material(self, material_id: int) -> list[QuestaoModel]: ...


class HistoricoRespostaRepository(ABC):
    @abstractmethod
    def criar(self, historico: HistoricoRespostaModel) -> HistoricoRespostaModel: ...

    @abstractmethod
    def listar_por_questoes(
        self, usuario_id: int, questoes_ids: list[int]
    ) -> list[HistoricoRespostaModel]: ...


class AvaliacaoDesempenhoRepository(ABC):
    @abstractmethod
    def criar(self, avaliacao: AvaliacaoDesempenhoModel) -> AvaliacaoDesempenhoModel: ...