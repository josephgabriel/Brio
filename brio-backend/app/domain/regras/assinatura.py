from datetime import date, timedelta
from app.domain.regras.tempo import hoje_local
from app.infrastructure.db.models.assinatura import Plano, StatusAssinatura

DURACAO_DIAS: dict[Plano, int] = {
    Plano.MENSAL: 30,
    Plano.ANUAL: 365,
}

PRECOS: dict[Plano, float] = {
    Plano.MENSAL: 9.90,
    Plano.ANUAL: 99.00,
}


def calcular_data_expiracao(plano: Plano, data_base: date | None = None) -> date:
    data_base = data_base or hoje_local()
    return data_base + timedelta(days=DURACAO_DIAS[plano])


def esta_dentro_do_prazo_reembolso(
    data_pagamento: date, hoje: date | None = None, dias: int = 7
) -> bool:
    hoje = hoje or hoje_local()
    return (hoje - data_pagamento).days <= dias


def assinatura_esta_valida(
    status: StatusAssinatura, data_expiracao: date | None, hoje: date | None = None
) -> bool:
    hoje = hoje or hoje_local()
    if status != StatusAssinatura.ATIVA:
        return False
    if data_expiracao is None:
        return False
    return data_expiracao >= hoje