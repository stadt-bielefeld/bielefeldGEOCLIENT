"""Added min- and max-res to digitize feature group

Revision ID: 4237cb2ca161
Revises:
Create Date: 2016-02-22 14:18:51.334162

"""

# revision identifiers, used by Alembic.
revision = '4237cb2ca161'
down_revision = None
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.add_column('digitize_feature_groups', sa.Column('max_res', sa.Float(), nullable=True))
    op.add_column('digitize_feature_groups', sa.Column('min_res', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('digitize_feature_groups', 'min_res')
    op.drop_column('digitize_feature_groups', 'max_res')
