from datetime import date, timedelta

DIAS_NA_SEMANA = 7


def inicio_da_semana(data: date) -> date:
    """Segunda-feira da semana de `data` (weekday() já conta segunda como 0)."""
    return data - timedelta(days=data.weekday())


def datas_da_semana(data: date) -> list[date]:
    inicio = inicio_da_semana(data)
    return [inicio + timedelta(days=i) for i in range(DIAS_NA_SEMANA)]


def ocorre_em(dia_semana: int, criado_em: date, data: date) -> bool:
    """A atividade acontece em `data` se cai no dia da semana dela e não é anterior à criação."""
    return data.weekday() == dia_semana and data >= criado_em