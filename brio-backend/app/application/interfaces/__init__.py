"""
Contratos abstratos (ex: classe abstrata ProvaRepository com métodos
como `salvar`, `buscar_por_id`).

A camada application só conhece essas abstrações -- não sabe se, por
baixo, os dados vão para Postgres, SQLite ou um arquivo em memória
(muito útil para testes).
"""
