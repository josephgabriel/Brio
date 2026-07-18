from app.application.interfaces.prova_repository import ProvaRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_provas import ObterProva
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class IniciarSessao:
    def __init__(
        self,
        sessao_repository: SessaoEstudoRepository,
        prova_repository: ProvaRepository,
    ) -> None:
        self.sessao_repository = sessao_repository
        self.obter_prova = ObterProva(prova_repository)

    def executar(
        self,
        usuario_id: int,
        prova_id: int,
        disciplina: str,
        assunto: str,
        objetivo: str | None = None,
    ) -> SessaoEstudoModel:
        # Reaproveita o ObterProva -- isso já garante que a prova
        # existe E pertence a esse usuário, levantando
        # ProvaNaoEncontradaError caso contrário. Sem essa checagem,
        # seria possível registrar horas de estudo contra a prova de
        # outra pessoa.
        self.obter_prova.executar(prova_id, usuario_id)

        sessao = SessaoEstudoModel(
            usuario_id=usuario_id,
            prova_id=prova_id,
            disciplina=disciplina,
            assunto=assunto,
            objetivo=objetivo,
        )
        return self.sessao_repository.criar(sessao)