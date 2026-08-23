from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.interfaces.topico_repository import TopicoRepository
from app.domain.exceptions import TopicoNaoEncontradoError
from app.domain.regras.estatisticas import calcular_media


class DeletarTopico:
    def __init__(
        self,
        topico_repository: TopicoRepository,
        disciplina_repository: DisciplinaRepository,
        sessao_repository: SessaoEstudoRepository,
    ) -> None:
        self.topico_repository = topico_repository
        self.disciplina_repository = disciplina_repository
        self.sessao_repository = sessao_repository

    def executar(self, topico_id: int, usuario_id: int) -> None:
        topico = self.topico_repository.buscar_por_id(topico_id)
        if topico is None or topico.usuario_id != usuario_id:
            raise TopicoNaoEncontradoError(f"Tópico {topico_id} não encontrado")

        disciplina_id = topico.disciplina_id
        self.topico_repository.deletar(topico)

        disciplina = self.disciplina_repository.buscar_por_id(disciplina_id)
        if disciplina is None:
            return

        sessoes = self.sessao_repository.listar_por_usuario(usuario_id, disciplina.prova_id)
        aprendizados = [
            s.aprendizado_percentual
            for s in sessoes
            if s.disciplina_id == disciplina.id
            and s.finalizada_em is not None
            and s.aprendizado_percentual is not None
        ]

        disciplina.nivel_conhecimento = round(calcular_media(aprendizados))
        self.disciplina_repository.atualizar(disciplina)