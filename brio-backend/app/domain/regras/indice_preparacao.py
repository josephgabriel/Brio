def calcular_indice_preparacao(
    taxa_conclusao_revisoes: float,
    horas_semana_atual: float,
    meta_horas_semana: float,
    cobertura_conteudo: float | None = None,
) -> int:
    """
    Sem cobertura de conteúdo (prova sem conteúdos cadastrados):
        50% revisões + 50% consistência
    Com cobertura:
        40% conteúdo concluído + 30% revisões + 30% consistência
    """
    if meta_horas_semana > 0:
        consistencia = min(100.0, (horas_semana_atual / meta_horas_semana) * 100)
    else:
        consistencia = 0.0

    if cobertura_conteudo is None:
        indice = taxa_conclusao_revisoes * 0.5 + consistencia * 0.5
    else:
        indice = (
            cobertura_conteudo * 0.4
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