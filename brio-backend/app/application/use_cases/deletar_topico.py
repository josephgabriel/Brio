# app/application/use_cases/deletar_topico.py
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import TopicoNaoEncontradoError


class DeletarTopico:
    def __init__(self, repository: TopicoRepository) -> None:
        self.repository = repository

    def executar(self, topico_id: int, usuario_id: int) -> None:
        topico = self.repository.buscar_por_id(topico_id)
        if topico is None or topico.usuario_id != usuario_id:
            raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")
        self.repository.deletar(topico)