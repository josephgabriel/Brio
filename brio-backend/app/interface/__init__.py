"""
Camada de INTERFACE (porta de entrada da aplicação).

Aqui ficam os routers do FastAPI e os schemas Pydantic de
entrada/saída da API. Esta camada NÃO deve conter regra de negócio --
apenas: receber requisição HTTP, validar formato, chamar o use case
certo, formatar a resposta.
"""
