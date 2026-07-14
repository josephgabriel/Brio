from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.config import settings

app = FastAPI(
    title = "Brio API",
    version="0.1.0",
    description="API da plataforma da BRIO.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check() -> dict[str,str]:
    return {"status": "ok", "environment": settings.environment}

"""
    Endpoint de verificação de saúde da API.

    Serve para dois propósitos:
    1. Agora: testar manualmente que o servidor subiu e a
       configuração (.env) foi lida corretamente.
    2. No futuro: hospedagens como Railway usam endpoints como este
       para saber se a aplicação está saudável e reiniciá-la caso
       contrário.
    """