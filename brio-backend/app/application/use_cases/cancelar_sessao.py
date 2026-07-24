from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_sessao import ObterSessao
from app.domain.exceptions import SessaoJaFinalizadaError


class CancelarSessao:
    def __init__(self, repository: SessaoEstudoRepository) -> None:
        self.repository = repository
        self.obter_sessao = ObterSessao(repository)

    def executar(self, sessao_id: int, usuario_id: int) -> None:
        sessao = self.obter_sessao.executar(sessao_id, usuario_id)

        if sessao.finalizada_em is not None:
            raise SessaoJaFinalizadaError(
                "Não é possível cancelar uma sessão que já foi finalizada"
            )

        self.repository.deletar(sessao)