"""
Um arquivo por caso de uso. Ex: criar_prova.py, listar_provas.py.

Estrutura típica de um use case:
1. Recebe dados de entrada (já validados pela camada de interface)
2. Aplica regras de negócio do domain/
3. Chama um repositório abstrato (interfaces/) para persistir/consultar
4. Retorna um resultado (não um Response HTTP -- isso é da camada de interface)
"""
