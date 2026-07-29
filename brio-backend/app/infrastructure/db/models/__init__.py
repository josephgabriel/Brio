"""
Importar cada modelo aqui garante que ele seja registrado em
Base.metadata assim que este pacote for importado -- é isso que o
Alembic usa para detectar tabelas automaticamente (autogenerate).

Se você criar um novo modelo e esquecer de importá-lo aqui, o
Alembic simplesmente não vai "enxergar" a tabela nova.
"""

from app.infrastructure.db.models.prova import ProvaModel  # noqa: F401
from app.infrastructure.db.models.revisao import RevisaoModel  # noqa: F401
from app.infrastructure.db.models.sessao_estudo import SessaoEstudoModel  # noqa: F401
from app.infrastructure.db.models.usuario import UsuarioModel  # noqa: F401
from app.infrastructure.db.models.disciplina import DisciplinaModel
from app.infrastructure.db.models.topico import TopicoModel
from app.infrastructure.db.models.anotacao import AnotacaoModel
from app.infrastructure.db.models.evento_metrica import EventoMetricaModel