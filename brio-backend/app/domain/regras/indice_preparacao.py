def calcular_indice_preparacao(
    nivel_medio_conhecimento: float,
    taxa_conclusao_revisoes: float,
    horas_semana_atual: float,
    meta_horas_semana: float,
) -> int:
    """
    Índice de 0 a 100 que mede o alinhamento entre o ritmo de estudo
    de uma prova e a meta que o próprio usuário definiu -- NÃO é uma
    previsão de aprovação, é um termômetro de consistência.

    40% nível médio de conhecimento das matérias
    30% taxa de conclusão de revisões
    30% consistência (horas estudadas na semana / meta semanal)
    """
    if meta_horas_semana > 0:
        consistencia = min(100.0, (horas_semana_atual / meta_horas_semana) * 100)
    else:
        consistencia = 0.0

    indice = (
        nivel_medio_conhecimento * 0.4
        + taxa_conclusao_revisoes * 0.3
        + consistencia * 0.3
    )
    return round(max(0.0, min(100.0, indice)))


def classificar_indice(indice: int) -> str:
    if indice >= 80:
        return "excelente"
    if indice >= 60:
        return "atencao"
    if indice >= 40:
        return "risco"
    return "critico"