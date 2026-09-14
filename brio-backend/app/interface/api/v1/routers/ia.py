from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.application.use_cases.gerar_avaliacao_desempenho import GerarAvaliacaoDesempenho
from app.application.use_cases.gerar_questoes_ia import GerarQuestoesIA
from app.application.use_cases.obter_cota_ia import ObterCotaIA
from app.application.use_cases.responder_questao import ResponderQuestao
from app.domain.exceptions import ArquivoInvalidoError, CotaIAExcedidaError, QuestaoNaoEncontradaError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.ia_repository import (
    SQLAlchemyAvaliacaoDesempenhoRepository,
    SQLAlchemyHistoricoRespostaRepository,
    SQLAlchemyMaterialEstudoRepository,
    SQLAlchemyQuestaoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.ia import (
    AvaliacaoDesempenhoResponseSchema,
    CotaIASchema,
    GerarAvaliacaoSchema,
    MaterialComQuestoesResponseSchema,
    ResponderQuestaoSchema,
    ResultadoRespostaSchema,
)

router = APIRouter(prefix="/api/v1/ia", tags=["ia"])

TAMANHO_MAXIMO_PDF = 8 * 1024 * 1024  # 8MB


@router.get("/cota", response_model=CotaIASchema)
def cota(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyMaterialEstudoRepository(db)
    resultado = ObterCotaIA(repository).executar(usuario_id=usuario.id)
    return CotaIASchema(usadas=resultado.usadas, limite=resultado.limite)


@router.post("/questoes/gerar", response_model=MaterialComQuestoesResponseSchema)
async def gerar(
    arquivo: UploadFile,
    topico_id: int | None = Form(default=None),
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    if arquivo.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie um arquivo PDF")

    conteudo = await arquivo.read()
    if len(conteudo) > TAMANHO_MAXIMO_PDF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="PDF muito grande (máximo 8MB)"
        )

    material_repository = SQLAlchemyMaterialEstudoRepository(db)
    questao_repository = SQLAlchemyQuestaoRepository(db)
    use_case = GerarQuestoesIA(material_repository, questao_repository)

    try:
        material, questoes = use_case.executar(
            usuario_id=usuario.id,
            nome_arquivo=arquivo.filename or "material.pdf",
            conteudo_pdf=conteudo,
            topico_id=topico_id,
        )
    except CotaIAExcedidaError as erro:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(erro))
    except ArquivoInvalidoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))

    return MaterialComQuestoesResponseSchema(material_id=material.id, questoes=questoes)


@router.post("/questoes/{questao_id}/responder", response_model=ResultadoRespostaSchema)
def responder(
    questao_id: int,
    dados: ResponderQuestaoSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    questao_repository = SQLAlchemyQuestaoRepository(db)
    material_repository = SQLAlchemyMaterialEstudoRepository(db)
    historico_repository = SQLAlchemyHistoricoRespostaRepository(db)
    use_case = ResponderQuestao(questao_repository, material_repository, historico_repository)

    try:
        resultado = use_case.executar(questao_id, usuario.id, dados.alternativa)
    except QuestaoNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return ResultadoRespostaSchema(
        correta=resultado.correta,
        resposta_correta=resultado.resposta_correta,
        explicacao=resultado.explicacao,
    )


@router.post("/avaliacao/gerar", response_model=AvaliacaoDesempenhoResponseSchema)
def avaliacao(
    dados: GerarAvaliacaoSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    questao_repository = SQLAlchemyQuestaoRepository(db)
    historico_repository = SQLAlchemyHistoricoRespostaRepository(db)
    avaliacao_repository = SQLAlchemyAvaliacaoDesempenhoRepository(db)
    use_case = GerarAvaliacaoDesempenho(questao_repository, historico_repository, avaliacao_repository)

    resultado = use_case.executar(usuario_id=usuario.id, material_id=dados.material_id)
    return resultado