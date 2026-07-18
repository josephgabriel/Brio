from datetime import date, timedelta

INTERVALOS_PADRAO_DIAS = [1, 7, 16, 35]

def gerar_datas_revisao(
        data_base: date, intervalos: list[int] | None = None
) -> list[date]:
    dias = intervalos or INTERVALOS_PADRAO_DIAS
    return [data_base + timedelta(days=dia) for dia in dias]