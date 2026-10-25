from datetime import date
from app.domain.regras.tempo import hoje_local
def calcular_dias_restantes(data_prova: date, hoje: date | None = None) -> int | None:
    if data_prova is None:
        return None
    
    hoje = hoje or hoje_local()
    return (data_prova - hoje).days