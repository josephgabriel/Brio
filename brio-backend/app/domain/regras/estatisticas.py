from datetime import date, timedelta


def calcular_taxa_conclusao(total: int, concluidas: int) -> float:
    """
    Calcula o percentual de itens concluídos em relação ao total,
    arredondado para 1 casa decimal.

    Retorna 0.0 se `total` for 0 -- evita divisão por zero quando o
    usuário ainda não tem nenhuma revisão agendada.
    """
    if total == 0:
        return 0.0
    return round((concluidas / total) * 100, 1)


def calcular_media(valores: list[int]) -> float:
    """
    Média simples de uma lista de números, arredondada a 1 casa
    decimal. Retorna 0.0 para lista vazia -- mesma lógica de
    "evitar divisão por zero" da função acima.
    """
    if not valores:
        return 0.0
    return round(sum(valores) / len(valores), 1)


def gerar_semanas_recentes(quantidade: int = 8, hoje: date | None = None) -> list[date]:
    """
    Gera uma lista de datas (sempre segunda-feira) representando o
    início de cada uma das últimas `quantidade` semanas, terminando
    na semana atual. Ordem: mais antiga primeiro.

    Isso serve de "esqueleto" do gráfico de evolução semanal -- toda
    semana aparece no gráfico, mesmo as que tiveram 0 horas
    estudadas, em vez de simplesmente não aparecerem.
    """
    hoje = hoje or date.today()
    inicio_semana_atual = hoje - timedelta(days=hoje.weekday())
    return [
        inicio_semana_atual - timedelta(weeks=i) for i in range(quantidade - 1, -1, -1)
    ]