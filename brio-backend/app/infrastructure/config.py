from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    environment: str = "production"
    mercadopago_access_token: str

    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    frontend_url: str = "https://brio-rho.vercel.app"
    backend_url: str
    email_verificacao_expira_horas: int = 24
    redefinicao_senha_expira_minutos: int = 15
    resend_api_key: str = ""
    email_remetente: str = "Brio <onboarding@resend.dev>"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

settings = Settings()

"""
    Configurações centrais da aplicação Brio.

    Cada atributo aqui corresponde a uma variável de ambiente lida do
    arquivo .env. O Pydantic valida o tipo de cada uma e falha ao
    iniciar a aplicação (fail-fast) se algo obrigatório estiver
    faltando ou com formato errado.
    """
