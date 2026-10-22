PESO_COBERTURA = 0.4
PESO_REVISOES = 0.3
PESO_CONSISTENCIA = 0.3


def calcular_indice_preparacao(
    taxa_revisoes_em_dia: float | None,
    horas_semana_atual: float,
    meta_horas_semana: float,
    cobertura_conteudo: float | None = None,
) -> int:
    """
    Índice de 0 a 100: 40% conteúdo concluído, 30% revisões em dia, 30%
    consistência semanal. Componentes sem dado (None) saem da conta e os
    pesos restantes são reescalados para somar 100%.
    """
    if meta_horas_semana > 0:
        consistencia = min(100.0, (horas_semana_atual / meta_horas_semana) * 100)
    else:
        consistencia = 0.0

    componentes = [(consistencia, PESO_CONSISTENCIA)]
    if taxa_revisoes_em_dia is not None:
        componentes.append((taxa_revisoes_em_dia, PESO_REVISOES))
    if cobertura_conteudo is not None:
        componentes.append((cobertura_conteudo, PESO_COBERTURA))

    soma_pesos = sum(peso for _, peso in componentes)
    indice = sum(valor * peso for valor, peso in componentes) / soma_pesos
    return round(max(0.0, min(100.0, indice)))


def classificar_indice(indice: int) -> str:
    if indice >= 80:
        return "excelente"
    if indice >= 60:
        return "atencao"
    if indice >= 40:
        return "risco"
    return "critico"