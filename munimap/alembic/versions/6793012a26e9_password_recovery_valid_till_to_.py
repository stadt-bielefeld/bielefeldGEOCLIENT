"""password_recovery.valid_till to timestamptz

Revision ID: 6793012a26e9
Revises: f25bceb5b510
Create Date: 2026-11-24 16:16:01.974900

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6793012a26e9'
down_revision = 'f25bceb5b510'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        'password_recovery',
        'valid_till',
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        postgresql_using="valid_till AT TIME ZONE 'UTC'",
    )

def downgrade():
    op.alter_column(
        'password_recovery',
        'valid_till',
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        postgresql_using="valid_till AT TIME ZONE 'UTC'",
    )
