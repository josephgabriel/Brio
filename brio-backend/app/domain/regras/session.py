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