"""add project settings

Revision ID: 1bb8cb3abf60
Revises: 393a0cce62c7
Create Date: 2018-08-22 15:20:47.132129

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1bb8cb3abf60'
down_revision = '393a0cce62c7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('mm_project_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('project', sa.String(), nullable=False),
        sa.Column('settings', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('mm_project_settings_user',
        sa.Column('mm_project_settings_id', sa.Integer(), nullable=True),
        sa.Column('mb_user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['mb_user_id'], ['mb_user.mb_user_id'], ),
        sa.ForeignKeyConstraint(['mm_project_settings_id'], ['mm_project_settings.id'], )
    )

def downgrade():
    op.drop_table('mm_project_settings_user')
    op.drop_table('mm_project_settings')
    