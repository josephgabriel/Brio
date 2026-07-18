from datetime import date, timedelta

def calcular_horas_estudadas(duracoes_minutos: list[int]) -> float:

    total_minutos = sum(duracoes_minutos)
    return round(total_minutos / 60,1)

def calcular_sequencia_dias_estudando(
        datas_estudadas: set[date], hoje: date | None = None
) -> int:
    hoje = hoje or date.today()
    sequencia = 0
    dia_atual = hoje

    while dia_atual in datas_estudadas:
        sequencia += 1
        dia_atual = timedelta(days=1)
        
    return sequencia
