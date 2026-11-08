from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.application.use_cases.listar_materiais_ia import ListarMateriaisIA
from app.application.use_cases.listar_questoes_do_material import ListarQuestoesDoMaterial

from app.application.use_cases.gerar_avaliacao_desempenho import GerarAvaliacaoDesempenho
from app.application.use_cases.gerar_questoes_ia import GerarQuestoesIA
from app.application.use_cases.obter_cota_ia import ObterCotaIA
from app.application.use_cases.responder_questao import ResponderQuestao
from app.domain.exceptions import (
    ArquivoInvalidoError,
    CotaIAExcedidaError,
    FalhaIAError,
    QuestaoNaoEncontradaError,
    MaterialNaoEncontradoError,
)
from app.domain.regras.cota_ia import QUANTIDADE_PADRAO, QUANTIDADES_PERMITIDAS
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
    MaterialDetalheSchema, MaterialResumoSchema,
)

router = APIRouter(prefix="/api/v1/ia", tags=["ia"])

TAMANHO_MAXIMO_PDF = 8 * 1024 * 1024  # 8 MB


@router.get("/cota", response_model=CotaIASchema)
def cota(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyMaterialEstudoRepository(db)
    resultado = ObterCotaIA(repository).executar(usuario_id=usuario.id)
    return CotaIASchema(
        usadas=resultado.usadas,
        limite=resultado.limite,
        quantidades_permitidas=list(QUANTIDADES_PERMITIDAS),
    )


# "def" e não "async def": esta rota chama o Gemini e o banco, que bloqueiam.
# Funções "def" rodam numa fila de threads; "async def" travaria o servidor inteiro.
@router.post("/questoes/gerar", response_model=MaterialComQuestoesResponseSchema)
def gerar(
    arquivo: UploadFile,
    topico_id: int | None = Form(default=None),
    quantidade: int = Form(default=QUANTIDADE_PADRAO),
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    if arquivo.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie um arquivo PDF")

    if quantidade not in QUANTIDADES_PERMITIDAS:
        opcoes = ", ".join(str(q) for q in QUANTIDADES_PERMITIDAS)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Escolha uma quantidade entre: {opcoes}",
        )

    # Lê no máximo 1 byte além do limite: não carrega um arquivo gigante na memória
    conteudo = arquivo.file.read(TAMANHO_MAXIMO_PDF + 1)
    if len(conteudo) > TAMANHO_MAXIMO_PDF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="PDF muito grande (máximo 8MB)"
        )

    use_case = GerarQuestoesIA(
        SQLAlchemyMaterialEstudoRepository(db), SQLAlchemyQuestaoRepository(db)
    )

    try:
        material, questoes = use_case.executar(
            usuario_id=usuario.id,
            nome_arquivo=(arquivo.filename or "material.pdf")[:200],
            conteudo_pdf=conteudo,
            topico_id=topico_id,
            quantidade=quantidade,
        )
    except CotaIAExcedidaError as erro:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(erro))
    except ArquivoInvalidoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))
    except FalhaIAError as erro:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(erro))

    return MaterialComQuestoesResponseSchema(material_id=material.id, questoes=questoes)


@router.post("/questoes/{questao_id}/responder", response_model=ResultadoRespostaSchema)
def responder(
    questao_id: int,
    dados: ResponderQuestaoSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ResponderQuestao(
        SQLAlchemyQuestaoRepository(db),
        SQLAlchemyMaterialEstudoRepository(db),
        SQLAlchemyHistoricoRespostaRepository(db),
    )

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
    use_case = GerarAvaliacaoDesempenho(
        SQLAlchemyQuestaoRepository(db),
        SQLAlchemyHistoricoRespostaRepository(db),
        SQLAlchemyAvaliacaoDesempenhoRepository(db),
    )

    try:
        return use_case.executar(usuario_id=usuario.id, material_id=dados.material_id)
    except FalhaIAError as erro:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(erro))
    
@router.get("/materiais", response_model=list[MaterialResumoSchema])
def listar_materiais(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ListarMateriaisIA(
        SQLAlchemyMaterialEstudoRepository(db),
        SQLAlchemyQuestaoRepository(db),
        SQLAlchemyHistoricoRespostaRepository(db),
    )
    return use_case.executar(usuario_id=usuario.id)


@router.get("/materiais/{material_id}/questoes", response_model=MaterialDetalheSchema)
def questoes_do_material(
    material_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ListarQuestoesDoMaterial(
        SQLAlchemyMaterialEstudoRepository(db),
        SQLAlchemyQuestaoRepository(db),
        SQLAlchemyHistoricoRespostaRepository(db),
    )
    try:
        return use_case.executar(material_id=material_id, usuario_id=usuario.id)
    except MaterialNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))