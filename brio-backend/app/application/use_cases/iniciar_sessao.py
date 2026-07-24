from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import DisciplinaNaoEncontradaError, TopicoNaoEncontradoError
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class IniciarSessao:
    def __init__(
        self,
        sessao_repository: SessaoEstudoRepository,
        disciplina_repository: DisciplinaRepository,
        topico_repository: TopicoRepository,
    ) -> None:
        self.sessao_repository = sessao_repository
        self.disciplina_repository = disciplina_repository
        self.topico_repository = topico_repository

    def executar(
        self,
        usuario_id: int,
        disciplina_id: int,
        topico_id: int,
        objetivo: str | None = None,
    ) -> SessaoEstudoModel:
        disciplina = self.disciplina_repository.buscar_por_id(disciplina_id)
        if disciplina is None or disciplina.usuario_id != usuario_id:
            raise DisciplinaNaoEncontradaError(f"Disciplina {disciplina_id} não encontrada")

        topico = self.topico_repository.buscar_por_id(topico_id)
        if (
            topico is None
            or topico.usuario_id != usuario_id
            or topico.disciplina_id != disciplina_id
        ):
            raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")

        sessao = SessaoEstudoModel(
            usuario_id=usuario_id,
            prova_id=disciplina.prova_id,
            disciplina_id=disciplina.id,
            topico_id=topico.id,
            disciplina=disciplina.nome,
            assunto=topico.nome,
            objetivo=objetivo,
        )
        return self.sessao_repository.criar(sessao)