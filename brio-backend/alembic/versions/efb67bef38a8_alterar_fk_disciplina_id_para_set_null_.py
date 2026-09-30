"""alterar fk disciplina_id para set null em sessoes_estudo

Revision ID: efb67bef38a8
Revises: 184be166c56c
Create Date: 2026-09-27 14:25:11.855795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efb67bef38a8'
down_revision: Union[str, None] = '184be166c56c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_constraint(
        "sessoes_estudo_disciplina_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_disciplina_id_fkey", "sessoes_estudo", "disciplinas", ["disciplina_id"], ["id"]
    )
