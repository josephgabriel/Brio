from dataclasses import dataclass
from datetime import date

from app.application.interfaces.evento_calendario_repository import (
    EventoCalendarioRepository,
)
from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.domain.regras.tempo import data_local
from app.infrastructure.db.models.prova import StatusProva


@dataclass
class ItemCalendario:
    tipo: str
    id: int
    titulo: str
    data: date
    concluido: bool | None
    rota: str | None
    detalhe: str | None = None


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

        provas_ativas = [
            p
            for p in self.prova_repository.listar_por_usuario(usuario_id)
            if p.status == StatusProva.ATIVA
        ]
        ids_ativas = {p.id for p in provas_ativas}

        for prova in provas_ativas:
            if prova.data_prova and data_inicio <= prova.data_prova <= data_fim:
                itens.append(
                    ItemCalendario(
                        tipo="prova",
                        id=prova.id,
                        titulo=prova.nome,
                        data=prova.data_prova,
                        concluido=None,
                        rota=f"/provas/{prova.id}",
                        detalhe=prova.instituicao_banca,
                    )
                )

        for sessao in self.sessao_repository.listar_por_usuario(usuario_id):
            data_sessao = data_local(sessao.iniciada_em)
            if not (data_inicio <= data_sessao <= data_fim):
                continue
            finalizada = sessao.finalizada_em is not None
            detalhe = (
                f"{sessao.duracao_minutos} min"
                if finalizada and sessao.duracao_minutos is not None
                else "Em andamento"
            )
            itens.append(
                ItemCalendario(
                    tipo="sessao",
                    id=sessao.id,
                    titulo=f"{sessao.disciplina} — {sessao.assunto}",
                    data=data_sessao,
                    concluido=finalizada,
                    rota=None,
                    detalhe=detalhe,
                )
            )

        revisoes = self.revisao_repository.listar_por_usuario(
            usuario_id, data_inicio=data_inicio, data_fim=data_fim
        )
        for revisao in revisoes:
            if revisao.prova_id not in ids_ativas:
                continue
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
                    detalhe=f"Revisão {revisao.intervalo_numero} de 4",
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
                    detalhe=evento.descricao,
                )
            )

        return itens