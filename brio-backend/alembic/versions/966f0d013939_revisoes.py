"""revisoes

Revision ID: 966f0d013939
Revises: cdb4e1d523bb
Create Date: 2026-10-01 11:17:49.564958

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '966f0d013939'
down_revision: Union[str, None] = 'cdb4e1d523bb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("revisoes_topico_id_fkey", "revisoes", type_="foreignkey")
    op.create_foreign_key(
        "revisoes_topico_id_fkey",
        "revisoes",
        "topicos",
        ["topico_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("revisoes_topico_id_fkey", "revisoes", type_="foreignkey")
    op.create_foreign_key(
        "revisoes_topico_id_fkey", "revisoes", "topicos", ["topico_id"], ["id"], ondelete="SET NULL"
    )