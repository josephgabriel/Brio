from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.config import settings
from app.interface.api.v1.routers import auth, provas

app = FastAPI(
    title="Brio API",
    version="0.1.0",
    description="API da plataforma Brio de organização de estudos.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(provas.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """
    Endpoint de verificação de saúde da API.

    Serve para dois propósitos:
    1. Agora: testar manualmente que o servidor subiu e a
       configuração (.env) foi lida corretamente.
    2. No futuro: hospedagens como Railway usam endpoints como este
       para saber se a aplicação está saudável e reiniciá-la caso
       contrário.
    """
    return {"status": "ok", "environment": settings.environment}