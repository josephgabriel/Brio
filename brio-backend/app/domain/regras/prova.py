from datetime import date

def calcular_dias_restantes(data_prova: date, hoje: date | None = None) -> int | None:
    if data_prova is None:
        return None
    
    hoje = hoje or date.today()
    return (data_prova - hoje).days