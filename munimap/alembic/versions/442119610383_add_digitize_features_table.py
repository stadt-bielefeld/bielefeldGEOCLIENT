"""Add digitize_features table

Revision ID: 442119610383
Revises: 1ea185ba1c63
Create Date: 2024-03-20 09:14:56.588279

"""
import geoalchemy2
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = '442119610383'
down_revision = '1ea185ba1c63'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()
    if 'digitize_features' not in tables:
        op.create_table(
            'digitize_features',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('layer_name', sa.String(), nullable=True),
            sa.Column('geometry', geoalchemy2.types.Geometry(srid=25832, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
            sa.Column('properties', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('created', sa.DateTime(), nullable=True),
            sa.Column('created_by', sa.Integer(), nullable=True),
            sa.Column('modified', sa.DateTime(), nullable=True),
            sa.Column('modified_by', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_digitize_features_layer_name'), 'digitize_features', ['layer_name'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_digitize_features_layer_name'), table_name='digitize_features')
    op.drop_index('idx_digitize_features_geometry', table_name='digitize_features', postgresql_using='gist', postgresql_ops={})
    op.drop_table('digitize_features')
