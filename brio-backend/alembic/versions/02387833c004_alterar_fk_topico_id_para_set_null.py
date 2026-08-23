"""alterar fk topico_id para set null

Revision ID: 02387833c004
Revises: 1f7c5db27acb
Create Date: 2026-08-21 18:49:38.627109

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02387833c004'
down_revision: Union[str, None] = '1f7c5db27acb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
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
    op.drop_constraint(
        "sessoes_estudo_topico_id_fkey", "sessoes_estudo", type_="foreignkey"
    )
    op.create_foreign_key(
        "sessoes_estudo_topico_id_fkey", "sessoes_estudo", "topicos", ["topico_id"], ["id"]
    )

    op.drop_constraint("revisoes_topico_id_fkey", "revisoes", type_="foreignkey")
    op.create_foreign_key(
        "revisoes_topico_id_fkey", "revisoes", "topicos", ["topico_id"], ["id"]
    )