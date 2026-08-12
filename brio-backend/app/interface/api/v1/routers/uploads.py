from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.domain.exceptions import ArquivoInvalidoError
from app.infrastructure.armazenamento.cloudinary_client import enviar_imagem
from app.infrastructure.db.models.usuario import UsuarioModel
from app.interface.api.v1.dependencies import get_usuario_assinante

router = APIRouter(prefix="/api/v1/uploads", tags=["uploads"])

TAMANHO_MAXIMO_BYTES = 3 * 1024 * 1024  # 3MB
TIPOS_PERMITIDOS = {"image/png", "image/jpeg", "image/webp", "image/gif"}


@router.post("/imagem")
async def upload_imagem(
    arquivo: UploadFile,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
):
    if arquivo.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de imagem não suportado (use PNG, JPEG, WEBP ou GIF)",
        )

    conteudo = await arquivo.read()
    if len(conteudo) > TAMANHO_MAXIMO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Imagem muito grande (máximo 3MB)",
        )

    url = enviar_imagem(conteudo)
    return {"url": url}