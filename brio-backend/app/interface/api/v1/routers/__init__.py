"""
Um arquivo por recurso: provas.py, sessoes.py, auth.py, etc.
Cada router só conhece: schemas Pydantic + use cases. Nunca importa
SQLAlchemy nem os models de infrastructure diretamente.
"""
