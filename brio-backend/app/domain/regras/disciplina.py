def calcular_novo_nivel(
    nivel_atual: int, aprendizado_percentual: int, peso: float = 0.3
) -> int:
    """
    Calcula o novo nível de conhecimento de uma disciplina após uma
    sessão de estudos, usando média móvel exponencial: o nível se
    move em direção ao aprendizado reportado, sem pular direto pra lá.

    `peso` controla o quanto uma única sessão pesa na mudança --
    0.3 significa que cada sessão "puxa" 30% da distância entre o
    nível atual e o aprendizado reportado.
    """
    novo = nivel_atual + (aprendizado_percentual - nivel_atual) * peso
    return max(0, min(100, round(novo)))