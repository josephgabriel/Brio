from datetime import datetime

def calcular_duracao_minutos(iniciada_em: datetime, finalizada_em: datetime) -> int:
    duracao = finalizada_em - iniciada_em
    return int(duracao.total_seconds() // 60)

"""
    Calcula quantos minutos durou uma sessão de estudos.
 
    Arredonda pra baixo (uma sessão de 90 segundos conta como 1
    minuto, não como 2) -- consistente com a forma como a maioria
    dos apps de produtividade contabiliza tempo.
    """

def calcular_duracao_efetiva_minutos(
    iniciada_em: datetime, finalizada_em: datetime, foco_segundos: int | None
) -> int:
    """
    Usa o tempo de foco que a tela contou (sem pausas). Sem esse dado
    (cliente antigo), cai no tempo de relógio. Nunca passa do tempo real
    decorrido: ninguém estuda mais tempo do que a sessão ficou aberta.
    """
    total_segundos = max(0, int((finalizada_em - iniciada_em).total_seconds()))
    if foco_segundos is None:
        return total_segundos // 60
    return min(max(0, foco_segundos), total_segundos) // 60