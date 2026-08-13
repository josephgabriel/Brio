from dataclasses import dataclass
from datetime import date

from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository


@dataclass
class ItemCalendario:
    tipo: str
    id: int
    titulo: str
    data: date
    concluido: bool | None
    rota: str | None


class ObterCalendario:
    def __init__(
        self,
        prova_repository: ProvaRepository,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
        evento_repository: EventoCalendarioRepository,
    ) -> None:
        self.prova_repository = prova_repository
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.evento_repository = evento_repository

    def executar(
        self, usuario_id: int, data_inicio: date, data_fim: date
    ) -> list[ItemCalendario]:
        itens: list[ItemCalendario] = []

        for prova in self.prova_repository.listar_por_usuario(usuario_id):
            if prova.data_prova and data_inicio <= prova.data_prova <= data_fim:
                itens.append(
                    ItemCalendario(
                        tipo="prova",
                        id=prova.id,
                        titulo=prova.nome,
                        data=prova.data_prova,
                        concluido=None,
                        rota=f"/provas/{prova.id}",
                    )
                )

        for sessao in self.sessao_repository.listar_por_usuario(usuario_id):
            data_sessao = sessao.iniciada_em.date()
            if data_inicio <= data_sessao <= data_fim:
                itens.append(
                    ItemCalendario(
                        tipo="sessao",
                        id=sessao.id,
                        titulo=f"{sessao.disciplina} — {sessao.assunto}",
                        data=data_sessao,
                        concluido=sessao.finalizada_em is not None,
                        rota=None,
                    )
                )

        revisoes = self.revisao_repository.listar_por_usuario(
            usuario_id, data_inicio=data_inicio, data_fim=data_fim
        )
        for revisao in revisoes:
            itens.append(
                ItemCalendario(
                    tipo="revisao",
                    id=revisao.id,
                    titulo=f"{revisao.disciplina} — {revisao.assunto}",
                    data=revisao.data_agendada,
                    concluido=revisao.concluida_em is not None,
                    rota=(
                        f"/topicos/{revisao.topico_id}/anotacao" if revisao.topico_id else None
                    ),
                )
            )

        for evento in self.evento_repository.listar_por_periodo(
            usuario_id, data_inicio, data_fim
        ):
            itens.append(
                ItemCalendario(
                    tipo=evento.tipo.value,
                    id=evento.id,
                    titulo=evento.titulo,
                    data=evento.data,
                    concluido=evento.concluido,
                    rota=None,
                )
            )

        return itens