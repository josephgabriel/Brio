from datetime import datetime, timedelta, timezone

from app.application.interfaces.anotacao_repository import AnotacaoRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import TopicoNaoEncontradoError
from app.infrastructure.db.models.anotacao import AnotacaoModel

INTERVALO_ENTRE_VERSOES = timedelta(minutes=5)
FATOR_ENCOLHIMENTO_SUSPEITO = 0.5
MAX_VERSOES_POR_ANOTACAO = 30


class SalvarAnotacao:
    def __init__(
        self, anotacao_repository: AnotacaoRepository, topico_repository: TopicoRepository
    ) -> None:
        self.anotacao_repository = anotacao_repository
        self.topico_repository = topico_repository

    def executar(self, topico_id: int, usuario_id: int, conteudo_html: str) -> AnotacaoModel:
        topico = self.topico_repository.buscar_por_id(topico_id)
        if topico is None or topico.usuario_id != usuario_id:
            raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")

        anotacao = self.anotacao_repository.buscar_por_topico(topico_id)
        if anotacao is None:
            anotacao = AnotacaoModel(usuario_id=usuario_id, topico_id=topico_id)
        else:
            self._guardar_versao_se_necessario(anotacao, conteudo_html)

        anotacao.conteudo_html = conteudo_html
        return self.anotacao_repository.salvar(anotacao)

    def _guardar_versao_se_necessario(self, anotacao: AnotacaoModel, novo_html: str) -> None:
        antigo = anotacao.conteudo_html or ""
        if not antigo.strip() or antigo == novo_html:
            return

        encolheu_muito = len(novo_html) < len(antigo) * FATOR_ENCOLHIMENTO_SUSPEITO

        ultima = self.anotacao_repository.data_ultima_versao(anotacao.id)
        agora = datetime.now(timezone.utc)
        passou_tempo = ultima is None or (agora - ultima) >= INTERVALO_ENTRE_VERSOES

        if encolheu_muito or passou_tempo:
            self.anotacao_repository.criar_versao(anotacao.id, antigo)
            self.anotacao_repository.podar_versoes(anotacao.id, MAX_VERSOES_POR_ANOTACAO)