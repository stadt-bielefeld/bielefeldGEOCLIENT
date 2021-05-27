"""Removed digitize group, user and permission

Revision ID: 4dc7cd47165d
Revises: 4f17336641b9
Create Date: 2017-08-07 09:51:15.285374

"""

# revision identifiers, used by Alembic.
revision = '4dc7cd47165d'
down_revision = '4f17336641b9'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    op.drop_table('user_groups')
    op.drop_table('groups_permissions')
    op.drop_table('groups')
    op.drop_table('users')
    op.drop_table('permissions')


def downgrade():
    op.create_table(
        'groups',
        sa.Column('id', sa.INTEGER(), nullable=False),
        sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column('title', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('id', name=u'groups_pkey'),
        sa.UniqueConstraint('name', name=u'groups_name_key'),
        sa.UniqueConstraint('title', name=u'groups_title_key')
    )
    op.create_table(
        'users',
        sa.Column('id', sa.INTEGER(), nullable=False),
        sa.Column('email', sa.VARCHAR(length=256), autoincrement=False, nullable=False),
        sa.Column('password', sa.VARCHAR(length=256), autoincrement=False, nullable=True),
        sa.Column('last_login', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.Column('active', sa.BOOLEAN(), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint('id', name=u'users_pkey'),
        sa.UniqueConstraint('email', name=u'users_email_key'),
        postgresql_ignore_search_path=False
    )
    op.create_table(
        'permissions',
        sa.Column('id', sa.INTEGER(), nullable=False),
        sa.Column('action', sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.PrimaryKeyConstraint('id', name=u'permissions_pkey'),
        sa.UniqueConstraint('action', name=u'permissions_action_key'),
        postgresql_ignore_search_path=False
    )
    op.create_table(
        'groups_permissions',
        sa.Column('group_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('permission_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['group_id'], [u'groups.id'], name=u'groups_permissions_group_id_fkey'),
        sa.ForeignKeyConstraint(['permission_id'], [u'permissions.id'], name=u'groups_permissions_permission_id_fkey')
    )
    op.create_table(
        'user_groups',
        sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('group_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['group_id'], [u'groups.id'], name=u'user_groups_group_id_fkey'),
        sa.ForeignKeyConstraint(['user_id'], [u'users.id'], name=u'user_groups_user_id_fkey')
    )
