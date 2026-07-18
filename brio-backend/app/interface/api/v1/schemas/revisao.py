from datetime import date, datetime

from pydantic import BaseModel

from app.infrastructure.db.models.revisao import RevisaoModel


class RevisaoResponseSchema(BaseModel):
    id: int
    prova_id: int
    sessao_estudo_id: int
    disciplina: str
    assunto: str
    intervalo_numero: int
    data_agendada: date
    concluida_em: datetime | None
    status: str

    @classmethod
    def from_model(cls, revisao: RevisaoModel) -> "RevisaoResponseSchema":
        if revisao.concluida_em is not None:
            status = "concluida"
        elif revisao.data_agendada < date.today():
            status = "atrasada"
        else:
            status = "pendente"

        return cls(
            id=revisao.id,
            prova_id=revisao.prova_id,
            sessao_estudo_id=revisao.sessao_estudo_id,
            disciplina=revisao.disciplina,
            assunto=revisao.assunto,
            intervalo_numero=revisao.intervalo_numero,
            data_agendada=revisao.data_agendada,
            concluida_em=revisao.concluida_em,
            status=status,
        )