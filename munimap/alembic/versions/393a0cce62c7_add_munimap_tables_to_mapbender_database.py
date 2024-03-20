"""Add munimap tables to mapbender database

Revision ID: 393a0cce62c7
Revises:
Create Date: 2017-07-28 15:31:28.546344

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '393a0cce62c7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'mm_layers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_table(
        'mm_projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_table(
        'mm_layer_group',
        sa.Column('mm_layer_id', sa.Integer(), nullable=True),
        sa.Column('mb_group_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['mb_group_id'], ['mb_group.mb_group_id'], ),
        sa.ForeignKeyConstraint(['mm_layer_id'], ['mm_layers.id'], )
    )
    op.create_table(
        'mm_project_group',
        sa.Column('mm_project_id', sa.Integer(), nullable=True),
        sa.Column('mb_group_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['mb_group_id'], ['mb_group.mb_group_id'], ),
        sa.ForeignKeyConstraint(['mm_project_id'], ['mm_projects.id'], )
    )


def downgrade():
    op.drop_table('mm_layer_group')
    op.drop_table('mm_project_group')
    op.drop_table('mm_projects')
    op.drop_table('mm_layers')
