"""recover password

Revision ID: 1d4792a4e895
Revises: 3b5889f7b0a7
Create Date: 2020-04-21 15:31:07.625490

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1d4792a4e895'
down_revision = '3b5889f7b0a7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('password_recovery',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('hash', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('valid_till', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['mb_user.mb_user_id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('hash')
    )

def downgrade():
    op.drop_table('password_recovery')
    