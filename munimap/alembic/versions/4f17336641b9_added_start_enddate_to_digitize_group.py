"""Added start, enddate to digitize group

Revision ID: 4f17336641b9
Revises: 4237cb2ca161
Create Date: 2016-10-18 16:16:56.159752

"""

# revision identifiers, used by Alembic.
revision = '4f17336641b9'
down_revision = '4237cb2ca161'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    op.add_column('digitize_feature_groups', sa.Column('_active', sa.Boolean(), nullable=True))
    op.add_column('digitize_feature_groups', sa.Column('end_date', sa.DateTime(), nullable=True))
    op.add_column('digitize_feature_groups', sa.Column('start_date', sa.DateTime(), nullable=True))
    op.drop_column('digitize_feature_groups', 'active')


def downgrade():
    op.add_column('digitize_feature_groups', sa.Column('active', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.drop_column('digitize_feature_groups', 'start_date')
    op.drop_column('digitize_feature_groups', 'end_date')
    op.drop_column('digitize_feature_groups', '_active')
