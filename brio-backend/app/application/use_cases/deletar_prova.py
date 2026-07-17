from app.application.interfaces.prova_repository import ProvaRepository
from app.application.use_cases.obter_provas import ObterProva


class DeletarProva:
    def __init__(self, repository: ProvaRepository) -> None:
        self.repository = repository
        self.obter_prova = ObterProva(repository)

    def executar(self, prova_id: int, usuario_id: int) -> None:
        prova = self.obter_prova.executar(prova_id, usuario_id)
        self.repository.deletar(prova)