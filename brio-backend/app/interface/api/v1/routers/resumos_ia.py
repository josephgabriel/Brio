from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.application.use_cases.arquivar_resumo_ia import ArquivarResumoIA
from app.application.use_cases.gerar_resumo_ia import GerarResumoIA
from app.application.use_cases.listar_resumos_ia import ListarResumosIA
from app.application.use_cases.obter_cota_resumos_ia import ObterCotaResumosIA
from app.application.use_cases.obter_resumo_ia import ObterResumoIA
from app.domain.exceptions import (
    ArquivoInvalidoError,
    CotaIAExcedidaError,
    FalhaIAError,
    ResumoNaoEncontradoError,
)
from app.domain.regras.resumo_ia import (
    NIVEIS_PERMITIDOS,
    NIVEL_PADRAO,
    TAMANHO_MAXIMO_PDF_BYTES,
)
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.resumo_ia_repository import (
    SQLAlchemyResumoIARepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.resumo_ia import (
    CotaResumosSchema,
    ResumoDetalheSchema,
    ResumoItemSchema,
)

router = APIRouter(prefix="/api/v1/ia/resumos", tags=["ia-resumos"])


# "/cota" vem ANTES de "/{resumo_id}": senão "cota" seria lido como um id
@router.get("/cota", response_model=CotaResumosSchema)
def cota(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    resultado = ObterCotaResumosIA(SQLAlchemyResumoIARepository(db)).executar(usuario.id)
    return CotaResumosSchema(
        usadas=resultado.usadas,
        limite=resultado.limite,
        niveis=list(NIVEIS_PERMITIDOS),
    )


@router.get("", response_model=list[ResumoItemSchema])
def listar(
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    return ListarResumosIA(SQLAlchemyResumoIARepository(db)).executar(usuario.id)


# "def" e não "async def": chama o Gemini e o banco, que bloqueiam
@router.post("", response_model=ResumoDetalheSchema, status_code=status.HTTP_201_CREATED)
def gerar(
    arquivo: UploadFile,
    nivel: str = Form(default=NIVEL_PADRAO),
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    if arquivo.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Envie um arquivo PDF")

    if nivel not in NIVEIS_PERMITIDOS:
        opcoes = ", ".join(NIVEIS_PERMITIDOS)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Escolha um nível entre: {opcoes}",
        )

    conteudo = arquivo.file.read(TAMANHO_MAXIMO_PDF_BYTES + 1)
    if len(conteudo) > TAMANHO_MAXIMO_PDF_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="PDF muito grande (máximo 8MB)"
        )

    use_case = GerarResumoIA(SQLAlchemyResumoIARepository(db))
    try:
        return use_case.executar(
            usuario_id=usuario.id,
            nome_arquivo=(arquivo.filename or "material.pdf")[:200],
            conteudo_pdf=conteudo,
            nivel=nivel,
        )
    except CotaIAExcedidaError as erro:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(erro))
    except ArquivoInvalidoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))
    except FalhaIAError as erro:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(erro))


@router.get("/{resumo_id}", response_model=ResumoDetalheSchema)
def obter(
    resumo_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    try:
        return ObterResumoIA(SQLAlchemyResumoIARepository(db)).executar(resumo_id, usuario.id)
    except ResumoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))


@router.delete("/{resumo_id}", status_code=status.HTTP_204_NO_CONTENT)
def arquivar(
    resumo_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    try:
        ArquivarResumoIA(SQLAlchemyResumoIARepository(db)).executar(resumo_id, usuario.id)
    except ResumoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))