from datetime import datetime, timezone

from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import TopicoNaoEncontradoError
from app.infrastructure.db.models.topico import TopicoModel


class DefinirTopicoConcluido:
    def __init__(self, repository: TopicoRepository) -> None:
        self.repository = repository

    def executar(self, topico_id: int, usuario_id: int, concluido: bool) -> TopicoModel:
        topico = self.repository.buscar_por_id(topico_id)
        if topico is None or topico.usuario_id != usuario_id:
            raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")

        topico.concluido = concluido
        topico.concluido_em = datetime.now(timezone.utc) if concluido else None
        return self.repository.atualizar(topico)