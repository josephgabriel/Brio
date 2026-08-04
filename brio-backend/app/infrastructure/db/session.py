from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.infrastructure.config import settings

engine = create_engine(
    settings.database_url,
    echo=(settings.environment == "development"),
    pool_pre_ping=True,  # Testa a conexão antes de executar queries (descarta conexões mortas)
    pool_recycle=1800,   # Recicla as conexões a cada 30 minutos
    pool_timeout=30,     # Tempo limite para obter uma conexão do pool
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    Classe base de todos os modelos SQLAlchemy do Brio.

    Toda tabela do banco é representada por uma classe Python que
    herda desta. O Alembic usa `Base.metadata` para saber quais
    tabelas devem existir e gerar as migrations automaticamente.
    """

    pass


def get_db():
    """
    Dependency do FastAPI: abre uma sessão de banco no início de uma
    requisição e garante que ela é fechada no final -- mesmo se a
    requisição terminar com erro.

    Uso em um router (a partir da Etapa 6):
        def listar_provas(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()