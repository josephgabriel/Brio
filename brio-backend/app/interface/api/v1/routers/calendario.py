# app/interface/api/v1/routers/calendario.py
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.obter_calendario import ObterCalendario
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.db.repositories.evento_calendario_repository import (
    SQLAlchemyEventoCalendarioRepository,
)
from app.infrastructure.db.repositories.prova_repository import SQLAlchemyProvaRepository
from app.infrastructure.db.repositories.revisao_repository import (
    SQLAlchemyRevisaoRepository,
)
from app.infrastructure.db.repositories.sessao_estudo_repository import (
    SQLAlchemySessaoEstudoRepository,
)
from app.infrastructure.db.session import get_db
from app.interface.api.v1.dependencies import get_usuario_assinante
from app.interface.api.v1.schemas.calendario import ItemCalendarioSchema

router = APIRouter(prefix="/api/v1/calendario", tags=["calendario"])


@router.get("", response_model=list[ItemCalendarioSchema])
def obter(
    data_inicio: date,
    data_fim: date,
    usuario: UsuarioModel = Depends(get_usuario_assinante),
    db: Session = Depends(get_db),
):
    use_case = ObterCalendario(
        SQLAlchemyProvaRepository(db),
        SQLAlchemySessaoEstudoRepository(db),
        SQLAlchemyRevisaoRepository(db),
        SQLAlchemyEventoCalendarioRepository(db),
    )
    itens = use_case.executar(usuario_id=usuario.id, data_inicio=data_inicio, data_fim=data_fim)
    return [ItemCalendarioSchema(**item.__dict__) for item in itens]