from app.application.interfaces.anotacao_repository import AnotacaoRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import TopicoNaoEncontradoError
from app.infrastructure.db.models.anotacao import AnotacaoModel

class ObterAnotacao:
    def __init__(
            self, anotacao_repository: AnotacaoRepository, topico_repository: TopicoRepository
    ) -> None:
         self.anotacao_repository = anotacao_repository
         self.topico_repository = topico_repository
    
    def executar(self, topico_id: int, usuario_id: int) -> AnotacaoModel:
         topico = self.topico_repository.buscar_por_id(topico_id)
         if topico is None or topico.usuario_id != usuario_id:
              raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")
         
         anotacao = self.anotacao_repository.buscar_por_topico(topico_id)
         if anotacao is not None:
              return anotacao
         
         return AnotacaoModel(usuario_id=usuario_id, topico_id=topico_id, conteudo_html = "")