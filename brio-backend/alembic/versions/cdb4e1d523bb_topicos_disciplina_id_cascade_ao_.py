"""topicos disciplina_id cascade ao excluir materia

Revision ID: cdb4e1d523bb
Revises: efb67bef38a8
Create Date: 2026-09-27 16:06:30.798513

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdb4e1d523bb'
down_revision: Union[str, None] = 'efb67bef38a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tópico pertence a uma Matéria: excluir a Matéria exclui seus Tópicos
    op.drop_constraint("topicos_disciplina_id_fkey", "topicos", type_="foreignkey")
    op.create_foreign_key(
        "topicos_disciplina_id_fkey",
        "topicos",
        "disciplinas",
        ["disciplina_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Histórico de estudo nunca é apagado: só perde o vínculo com tópico/matéria
    op.drop_constraint(
        "sessoes_estudo_topico_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_topico_id_fkey",
        "sessoes_estudo",
        "topicos",
        ["topico_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_constraint(
        "sessoes_estudo_disciplina_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_disciplina_id_fkey",
        "sessoes_estudo",
        "disciplinas",
        ["disciplina_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.drop_constraint("revisoes_topico_id_fkey", "revisoes", type_="foreignkey")
    op.create_foreign_key(
        "revisoes_topico_id_fkey",
        "revisoes",
        "topicos",
        ["topico_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("topicos_disciplina_id_fkey", "topicos", type_="foreignkey")
    op.create_foreign_key(
        "topicos_disciplina_id_fkey", "topicos", "disciplinas", ["disciplina_id"], ["id"]
    )

    op.drop_constraint(
        "sessoes_estudo_topico_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_topico_id_fkey", "sessoes_estudo", "topicos", ["topico_id"], ["id"]
    )

    op.drop_constraint(
        "sessoes_estudo_disciplina_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_disciplina_id_fkey",
        "sessoes_estudo",
        "disciplinas",
        ["disciplina_id"],
        ["id"],
    )

    op.drop_constraint("revisoes_topico_id_fkey", "revisoes", type_="foreignkey")
    op.create_foreign_key(
        "revisoes_topico_id_fkey", "revisoes", "topicos", ["topico_id"], ["id"]
    )