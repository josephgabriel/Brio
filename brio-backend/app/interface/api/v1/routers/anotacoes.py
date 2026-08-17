from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.obter_anotacao import ObterAnotacao
from app.application.use_cases.salvar_anotacao import SalvarAnotacao
from app.domain.exceptions import TopicoNaoEncontradoError
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.anotacao_repository import (
    SQLAlchemyAnotacaoRepository,
)
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.anotacao import AnotacaoResponseSchema, AnotacaoSalvarSchema

from fastapi.responses import Response
from app.infrastructure.pdf.gerador_pdf import gerar_pdf_anotacao
from app.infrastructure.db.repositories.topico_repository import SQLAlchemyTopicoRepository

router = APIRouter(tags=["anotacoes"])


@router.get("/api/v1/topicos/{topico_id}/anotacao", response_model=AnotacaoResponseSchema)
def obter(
    topico_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    anotacao_repository = SQLAlchemyAnotacaoRepository(db)
    topico_repository = SQLAlchemyTopicoRepository(db)
    use_case = ObterAnotacao(anotacao_repository, topico_repository)

    try:
        anotacao = use_case.executar(topico_id=topico_id, usuario_id=usuario.id)
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return anotacao


@router.put("/api/v1/topicos/{topico_id}/anotacao", response_model=AnotacaoResponseSchema)
def salvar(
    topico_id: int,
    dados: AnotacaoSalvarSchema,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    anotacao_repository = SQLAlchemyAnotacaoRepository(db)
    topico_repository = SQLAlchemyTopicoRepository(db)
    use_case = SalvarAnotacao(anotacao_repository, topico_repository)

    try:
        anotacao = use_case.executar(
            topico_id=topico_id, usuario_id=usuario.id, conteudo_html=dados.conteudo_html
        )
    except TopicoNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    return anotacao

@router.get("/api/v1/topicos/{topico_id}/anotacao/pdf")
def exportar_pdf(
    topico_id: int,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    topico_repository = SQLAlchemyTopicoRepository(db)
    topico = topico_repository.buscar_por_id(topico_id)
    if topico is None or topico.usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tópico não encontrado")

    anotacao_repository = SQLAlchemyAnotacaoRepository(db)
    use_case = ObterAnotacao(anotacao_repository, topico_repository)
    anotacao = use_case.executar(topico_id=topico_id, usuario_id=usuario.id)

    pdf_bytes = gerar_pdf_anotacao(
        titulo=topico.nome,
        subtitulo="Exportado do Brio",
        conteudo_html=anotacao.conteudo_html or "<p><em>Sem conteúdo ainda.</em></p>",
    )

    nome_arquivo = topico.nome.replace(" ", "_")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{nome_arquivo}.pdf"'},
    )