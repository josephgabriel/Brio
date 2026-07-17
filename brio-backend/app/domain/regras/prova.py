from datetime import date

def calcular_dias_restantes(data_prova: date, hoje: date | None = None) -> int:
    hoje = hoje or date.today()
    return (data_prova - hoje).days