"""add default project settings

Revision ID: 3b5889f7b0a7
Revises: 1bb8cb3abf60
Create Date: 2018-09-04 09:57:05.102647

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3b5889f7b0a7'
down_revision = '1bb8cb3abf60'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('mm_project_default_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mm_project_id', sa.Integer(), nullable=True),
        sa.Column('mm_project_settings_id', sa.Integer(), nullable=True),
        sa.Column('mb_user_id', sa.Integer(), nullable=True),
        # sa.ForeignKeyConstraint(['mm_project_id'], ['mm_projects.id'], ),
        # sa.ForeignKeyConstraint(['mb_user_id'], ['mb_user.mb_user_id'], ),
        # sa.ForeignKeyConstraint(['mm_project_settings_id'], ['mm_project_settings.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade():
    op.drop_table('mm_project_default_settings')
