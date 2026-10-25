from datetime import datetime, timezone

from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_sessao import ObterSessao
from app.domain.exceptions import SessaoJaFinalizadaError
from app.domain.regras.revisao import gerar_datas_revisao
from app.domain.regras.session import calcular_duracao_efetiva_minutos
from app.domain.regras.tempo import data_local
from app.infrastructure.db.models.revisao import RevisaoModel
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class FinalizarSessao:
    def __init__(
        self,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
    ) -> None:
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.obter_sessao = ObterSessao(sessao_repository)

    def executar(
        self,
        sessao_id: int,
        usuario_id: int,
        duracao_foco_segundos: int | None = None,
    ) -> SessaoEstudoModel:
        sessao = self.obter_sessao.executar(sessao_id, usuario_id)

        if sessao.finalizada_em is not None:
            raise SessaoJaFinalizadaError(f"Sessão {sessao_id} já foi finalizada")

        sessao.finalizada_em = datetime.now(timezone.utc)
        sessao.duracao_minutos = calcular_duracao_efetiva_minutos(
            sessao.iniciada_em, sessao.finalizada_em, duracao_foco_segundos
        )
        sessao = self.sessao_repository.atualizar(sessao)

        datas = gerar_datas_revisao(data_local(sessao.finalizada_em))
        revisoes = [
            RevisaoModel(
                usuario_id=usuario_id,
                prova_id=sessao.prova_id,
                sessao_estudo_id=sessao.id,
                topico_id=sessao.topico_id,
                disciplina=sessao.disciplina,
                assunto=sessao.assunto,
                intervalo_numero=numero,
                data_agendada=data,
            )
            for numero, data in enumerate(datas, start=1)
        ]
        self.revisao_repository.criar_varias(revisoes)

        return sessao