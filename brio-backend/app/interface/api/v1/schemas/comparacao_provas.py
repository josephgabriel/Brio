from pydantic import BaseModel

from app.application.use_cases.obter_comparacao_provas import ResumoComparacaoProva


class ResumoComparacaoProvaSchema(BaseModel):
    prova_id: int
    nome: str
    total_horas_estudadas: float
    total_sessoes: int
    taxa_conclusao_revisoes: float
    indice_preparacao: int
    classificacao_indice: str

    @classmethod
    def from_resumo(cls, resumo: ResumoComparacaoProva) -> "ResumoComparacaoProvaSchema":
        return cls(**resumo.__dict__)