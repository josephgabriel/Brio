from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.use_cases.criar_assinatura import CriarAssinatura
from app.application.use_cases.obter_minha_assinatura import ObterMinhaAssinatura
from app.application.use_cases.solicitar_reembolso import SolicitarReembolso
from app.domain.exceptions import (
    AssinaturaJaExisteError,
    AssinaturaNaoEncontradaError,
    ForaDoPrazoReembolsoError,
)
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.assinatura_repository import (
    SQLAlchemyAssinaturaRepository,
)
from app.infrastructure.db.repositories.pagamento_repository import (
    SQLAlchemyPagamentoRepository,
)
from app.infrastructure.db.session import get_db
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient
from app.interface.api.v1.dependencies import get_current_user
from app.interface.api.v1.schemas.assinatura import (
    AssinaturaResponseSchema,
    CriarAssinaturaResponseSchema,
    CriarAssinaturaSchema,
)

router = APIRouter(prefix="/api/v1/assinatura", tags=["assinatura"])


@router.post("/criar", response_model=CriarAssinaturaResponseSchema)
def criar(
    dados: CriarAssinaturaSchema,
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyAssinaturaRepository(db)
    use_case = CriarAssinatura(repository, MercadoPagoClient())

    try:
        checkout_url = use_case.executar(usuario, dados.plano)
    except AssinaturaJaExisteError as erro:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(erro))

    return CriarAssinaturaResponseSchema(checkout_url=checkout_url)


@router.get("/minha", response_model=AssinaturaResponseSchema | None)
def minha(
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repository = SQLAlchemyAssinaturaRepository(db)
    return ObterMinhaAssinatura(repository).executar(usuario.id)


@router.post("/reembolso", status_code=status.HTTP_204_NO_CONTENT)
def reembolso(
    usuario: UsuarioModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assinatura_repository = SQLAlchemyAssinaturaRepository(db)
    pagamento_repository = SQLAlchemyPagamentoRepository(db)
    use_case = SolicitarReembolso(
        assinatura_repository, pagamento_repository, MercadoPagoClient()
    )

    try:
        use_case.executar(usuario.id)
    except AssinaturaNaoEncontradaError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
    except ForaDoPrazoReembolsoError as erro:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(erro))