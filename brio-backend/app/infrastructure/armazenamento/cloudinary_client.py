import cloudinary
import cloudinary.uploader

from app.infrastructure.config import settings

_configurado = False


def _garantir_configurado() -> None:
    global _configurado
    if not _configurado:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
        )
        _configurado = True


def enviar_imagem(conteudo_arquivo: bytes) -> str:
    """
    Envia os bytes de uma imagem pro Cloudinary e devolve a URL
    pública dela. `folder="brio/anotacoes"` organiza os uploads
    dentro da sua conta do Cloudinary, separado de qualquer outra
    coisa que você venha a hospedar lá no futuro.
    """
    _garantir_configurado()
    resultado = cloudinary.uploader.upload(conteudo_arquivo, folder="brio/anotacoes")
    return resultado["secure_url"]