"""adicionar renovacao_automatica em assinaturas

Revision ID: 184be166c56c
Revises: b9a5fcb2555d
Create Date: 2026-09-16 19:28:38.407639

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '184be166c56c'
down_revision: Union[str, None] = 'b9a5fcb2555d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "assinaturas",
        sa.Column("renovacao_automatica", sa.Boolean(), nullable=True),
    )
    op.execute("UPDATE assinaturas SET renovacao_automatica = true")
    op.alter_column("assinaturas", "renovacao_automatica", nullable=False)


def downgrade() -> None:
    op.drop_column("assinaturas", "renovacao_automatica")