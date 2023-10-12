"""Update digitize related tables

Revision ID: 3f547142e73c
Revises: 4dc7cd47165d
Create Date: 2023-10-12 11:23:15.973197

"""

# revision identifiers, used by Alembic.
revision = '3f547142e73c'
down_revision = '4dc7cd47165d'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    op.add_column('digitize_features', sa.Column('layer_name', sa.String(), nullable=True))
    op.create_index(op.f('ix_digitize_features_layer_name'), 'digitize_features', ['layer_name'], unique=False)

    # set values for layer_name
    op.execute("""
        WITH dl AS (
            SELECT
                dl.name, df.id
            FROM
                digitize_layers dl
            JOIN digitize_feature_groups dfg ON
                dfg.layer_id = dl.id
            JOIN digitize_features df ON
                df.feature_group_id = dfg.id
        )
        UPDATE digitize_features d SET layer_name = (SELECT dl.name FROM dl WHERE dl.id = d.id)""")

    op.drop_constraint('digitize_features_feature_group_id_fkey', 'digitize_features', type_='foreignkey')
    op.drop_column('digitize_features', 'feature_group_id')
    op.drop_table('digitize_feature_groups')
    op.drop_table('digitize_layers')
    op.add_column('digitize_features', sa.Column('created', sa.DateTime(), nullable=True))
    op.add_column('digitize_features', sa.Column('modified', sa.DateTime(), nullable=True))
    op.drop_column('digitize_features', 'style')
    # convert column "property" from type hstore to type jsonb
    op.execute("ALTER TABLE digitize_features ALTER COLUMN properties TYPE JSONB USING properties::jsonb")


def downgrade():
    op.create_table('digitize_layers',
                    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.Column('title', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.Column('_properties_schema', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.Column('_style', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.PrimaryKeyConstraint('id', name='digitize_layers_pkey'),
                    sa.UniqueConstraint('name', name='digitize_layers_name_key')
                    )
    op.create_table('digitize_feature_groups',
                    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
                    sa.Column('layer_id', sa.INTEGER(), autoincrement=False, nullable=True),
                    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.Column('title', sa.VARCHAR(), autoincrement=False, nullable=True),
                    sa.Column('min_res', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
                    sa.Column('max_res', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
                    sa.Column('_active', sa.BOOLEAN(), autoincrement=False, nullable=True),
                    sa.Column('end_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
                    sa.Column('start_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
                    sa.ForeignKeyConstraint(['layer_id'], ['digitize_layers.id'], name='digitize_feature_groups_layer_id_fkey'),
                    sa.PrimaryKeyConstraint('id', name='digitize_feature_groups_pkey'),
                    sa.UniqueConstraint('name', name='digitize_feature_groups_name_key')
                    )
    op.add_column('digitize_features', sa.Column('style', postgresql.HSTORE(text_type=sa.Text()), autoincrement=False, nullable=True))
    op.add_column('digitize_features', sa.Column('feature_group_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('digitize_features_feature_group_id_fkey', 'digitize_features', 'digitize_feature_groups', ['feature_group_id'], ['id'])
    op.drop_index(op.f('ix_digitize_features_layer_name'), table_name='digitize_features')
    op.drop_column('digitize_features', 'modified')
    op.drop_column('digitize_features', 'created')
    op.drop_column('digitize_features', 'layer_name')
