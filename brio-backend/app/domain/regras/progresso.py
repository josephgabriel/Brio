def calcular_cobertura_conteudo(contagens: dict[int, tuple[int, int]]) -> float | None:
    """
    Recebe {disciplina_id: (total, concluidos)} e devolve o percentual de
    conteúdos concluídos da prova inteira. Devolve None se não existe
    nenhum conteúdo cadastrado, já que 0% e "sem dados" são coisas diferentes.
    """
    total = sum(t for t, _ in contagens.values())
    if total == 0:
        return None
    concluidos = sum(c for _, c in contagens.values())
    return round((concluidos / total) * 100, 1)