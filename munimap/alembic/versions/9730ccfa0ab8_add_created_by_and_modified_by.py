"""add digitize feature created_by and modified_by

Revision ID: 9730ccfa0ab8
Revises: 3f547142e73c
Create Date: 2023-10-16 11:01:00.064477

"""

# revision identifiers, used by Alembic.
revision = '9730ccfa0ab8'
down_revision = '3f547142e73c'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('digitize_features', sa.Column('created_by', sa.Integer(), nullable=True))
    op.add_column('digitize_features', sa.Column('modified_by', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('digitize_features', 'modified_by')
    op.drop_column('digitize_features', 'created_by')
