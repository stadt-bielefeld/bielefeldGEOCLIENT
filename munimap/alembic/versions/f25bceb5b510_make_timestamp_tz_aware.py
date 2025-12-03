"""make_timestamp_tz_aware

Revision ID: f25bceb5b510
Revises: 14cdb156f5c2
Create Date: 2025-12-03 11:15:00.241849

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f25bceb5b510'
down_revision = '14cdb156f5c2'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        "password_recovery",
        "valid_till",
        type_=sa.TIMESTAMP(timezone=True),
        existing_type=sa.TIMESTAMP(timezone=False),
        postgresql_using="valid_till AT TIME ZONE 'UTC'"
    )
    op.alter_column(
        "digitize_features",
        "created",
        type_=sa.TIMESTAMP(timezone=True),
        existing_type=sa.TIMESTAMP(timezone=False),
        postgresql_using="created AT TIME ZONE 'UTC'"
    )
    op.alter_column(
        "digitize_features",
        "modified",
        type_=sa.TIMESTAMP(timezone=True),
        existing_type=sa.TIMESTAMP(timezone=False),
        postgresql_using="modified AT TIME ZONE 'UTC'"
    )

def downgrade():
    op.alter_column(
        "password_recovery",
        "valid_till",
        type_=sa.TIMESTAMP(timezone=False),
        existing_type=sa.TIMESTAMP(timezone=True),
        postgresql_using="valid_till"
    )
    op.alter_column(
        "digitize_features",
        "created",
        type_=sa.TIMESTAMP(timezone=False),
        existing_type=sa.TIMESTAMP(timezone=True),
        postgresql_using="created"
    )
    op.alter_column(
        "digitize_features",
        "modified",
        type_=sa.TIMESTAMP(timezone=False),
        existing_type=sa.TIMESTAMP(timezone=True),
        postgresql_using="modified"
    )
