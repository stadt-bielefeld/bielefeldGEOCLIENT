"""update user

Revision ID: 1ea185ba1c63
Revises: 1d4792a4e895
Create Date: 2020-04-21 16:31:53.760750

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1ea185ba1c63'
down_revision = '1d4792a4e895'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('mb_user', sa.Column('mb_user_active', sa.Boolean(), nullable=True))
    op.add_column('mb_user', sa.Column('mb_user_idm_managed', sa.Boolean(), nullable=True))

    op.execute(
        "update mb_user set mb_user_active = true where mb_user_login_count != 99;"
    )

    op.execute(
        "update mb_user set mb_user_active = false where mb_user_login_count = 99;"
    )

def downgrade():
    op.drop_column('mb_user', 'mb_user_idm_managed')
    op.drop_column('mb_user', 'mb_user_active')