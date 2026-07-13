"""
Camada de DOMÍNIO.

Aqui vivem as regras de negócio puras do Brio: o que é uma Prova,
o que é uma Sessão de Estudos, quais invariantes elas precisam respeitar.

Regra de ouro desta pasta: NENHUM import de FastAPI, SQLAlchemy, Pydantic
ou qualquer biblioteca externa. Só Python puro (dataclasses, enums, etc).
Isso garante que a regra de negócio pode ser testada sem subir banco
de dados nem servidor.
"""
