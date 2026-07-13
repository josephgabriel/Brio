"""
Modelos SQLAlchemy (mapeamento objeto-relacional para o Postgres).

Cuidado: um Model SQLAlchemy NÃO é a mesma coisa que uma Entidade de
domínio (app/domain/entities/). O Model descreve como os dados são
gravados no banco (tabelas, colunas, foreign keys). A Entidade
descreve a regra de negócio. Vamos ter uma pequena camada de
conversão entre os dois dentro dos repositórios.
"""
