from datetime import datetime, timezone

from app.application.interfaces.disciplina_repository import DisciplinaRepository
from app.application.interfaces.revisao_repository import RevisaoRepository
from app.application.interfaces.sessao_estudo_repository import SessaoEstudoRepository
from app.application.use_cases.obter_sessao import ObterSessao
from app.domain.exceptions import SessaoJaFinalizadaError
from app.domain.regras.disciplina import calcular_novo_nivel
from app.domain.regras.revisao import gerar_datas_revisao
from app.domain.regras.session import calcular_duracao_minutos
from app.infrastructure.db.models.revisao import RevisaoModel
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel


class FinalizarSessao:
    def __init__(
        self,
        sessao_repository: SessaoEstudoRepository,
        revisao_repository: RevisaoRepository,
        disciplina_repository: DisciplinaRepository,
    ) -> None:
        self.sessao_repository = sessao_repository
        self.revisao_repository = revisao_repository
        self.disciplina_repository = disciplina_repository
        self.obter_sessao = ObterSessao(sessao_repository)

    def executar(
        self,
        sessao_id: int,
        usuario_id: int,
        concentracao: int,
        dificuldade: int,
        aprendizado_percentual: int,
    ) -> SessaoEstudoModel:
        sessao = self.obter_sessao.executar(sessao_id, usuario_id)

        if sessao.finalizada_em is not None:
            raise SessaoJaFinalizadaError(f"Sessão {sessao_id} já foi finalizada")

        sessao.finalizada_em = datetime.now(timezone.utc)
        sessao.duracao_minutos = calcular_duracao_minutos(
            sessao.iniciada_em, sessao.finalizada_em
        )
        sessao.concentracao = concentracao
        sessao.dificuldade = dificuldade
        sessao.aprendizado_percentual = aprendizado_percentual
        sessao = self.sessao_repository.atualizar(sessao)

        # Revisões (Etapa 8, inalterado)
        datas = gerar_datas_revisao(sessao.finalizada_em.date())
        revisoes = [
            RevisaoModel(
                usuario_id=usuario_id,
                prova_id=sessao.prova_id,
                sessao_estudo_id=sessao.id,
                disciplina=sessao.disciplina,
                assunto=sessao.assunto,
                intervalo_numero=numero,
                data_agendada=data,
            )
            for numero, data in enumerate(datas, start=1)
        ]
        self.revisao_repository.criar_varias(revisoes)

        # Novo: atualiza o nível de conhecimento da disciplina
        if sessao.disciplina_id is not None:
            disciplina = self.disciplina_repository.buscar_por_id(sessao.disciplina_id)
            if disciplina is not None:
                disciplina.nivel_conhecimento = calcular_novo_nivel(
                    disciplina.nivel_conhecimento, aprendizado_percentual
                )
                self.disciplina_repository.atualizar(disciplina)

        return sessao