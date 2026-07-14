from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    environment: str = "development"

    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

settings = Settings()

"""
    Configurações centrais da aplicação Brio.

    Cada atributo aqui corresponde a uma variável de ambiente lida do
    arquivo .env. O Pydantic valida o tipo de cada uma e falha ao
    iniciar a aplicação (fail-fast) se algo obrigatório estiver
    faltando ou com formato errado.
    """
