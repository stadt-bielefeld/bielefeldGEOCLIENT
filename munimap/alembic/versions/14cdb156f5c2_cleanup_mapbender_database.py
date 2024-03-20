"""cleanup mapbender database

Revision ID: 14cdb156f5c2
Revises: 442119610383
Create Date: 2024-03-20 09:19:44.011744

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '14cdb156f5c2'
down_revision = '442119610383'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "drop view search_wfs_view;"
    )
    op.execute(
        "drop view registrating_groups;"
    )
    op.drop_table('gui_wms')
    op.drop_table('gui_wfs_conf')
    op.drop_table('wfs_conf_element')
    op.drop_table('wfs_conf')
    op.drop_table('wms_srs')
    op.drop_table('conformity_relation')
    op.drop_table('inspire_md_data')
    op.drop_table('layer_epsg')
    op.drop_table('ows_relation_metadata')
    op.drop_table('gui_mb_group')
    op.drop_table('layer_custom_category')
    op.drop_table('gui_gui_category')
    op.drop_table('layer_inspire_category')
    op.drop_table('wfs_featuretype_inspire_category')
    op.drop_table('wmc_inspire_category')
    op.drop_table('inspire_category')
    op.drop_table('datalink_keyword')
    op.drop_table('datalink_md_topic_category')
    op.drop_table('datalink')
    op.drop_table('wfs_featuretype_custom_category')
    op.drop_table('wmc_custom_category')
    op.drop_table('custom_category')
    op.drop_table('wfs_featuretype_md_topic_category')
    op.drop_table('wfs_featuretype_keyword')
    op.drop_table('wfs_element')
    op.drop_table('wfs_featuretype_namespace')
    op.drop_table('wfs_featuretype')
    op.drop_table('spec')
    op.drop_table('spec_classification')
    op.drop_index('ind_keyword', table_name='keyword')
    op.drop_table('layer_keyword')
    op.drop_table('wmc_keyword')
    op.drop_table('cat_keyword')
    op.drop_table('keyword')
    op.drop_index('idx_wms_id', table_name='wms')
    op.drop_table('layer_preview')
    op.drop_table('layer_load_count')
    op.drop_table('layer_md_topic_category')
    op.drop_table('layer_style')
    op.drop_table('gui_layer')
    op.drop_table('sld_user_layer')
    op.drop_table('layer')
    op.drop_table('mb_user_abo_ows')
    op.drop_table('mb_wms_availability')
    op.drop_table('wms_format')
    op.drop_table('wms_md_topic_category')
    op.drop_table('wms_termsofuse')
    op.drop_index('idx_mb_monitor_status', table_name='mb_monitor')
    op.drop_index('idx_mb_monitor_upload_id', table_name='mb_monitor')
    op.drop_table('mb_monitor')
    op.drop_table('wms')
    op.drop_table('wmc_md_topic_category')
    op.drop_table('md_topic_category')
    op.drop_table('gui_treegde')
    op.drop_table('gui_element_vars')
    op.drop_table('gui_element')
    op.drop_table('gui_cat')
    op.drop_table('gui_mb_user')
    op.drop_table('gui_wfs')
    op.drop_table('gui_kml')
    op.drop_table('gui')
    op.drop_table('wmc_preview')
    op.drop_index('idx_fkey_wmc_serial_id', table_name='wmc_load_count')
    op.drop_table('wmc_load_count')
    op.drop_index('idx_mb_user_wmc_id', table_name='mb_user_wmc')
    op.drop_index('idx_mb_user_wmc_user_id', table_name='mb_user_wmc')
    op.drop_table('mb_user_wmc')
    op.drop_constraint('fkey_mb_user_mb_group_role_id', 'mb_user_mb_group', type_='foreignkey')
    op.drop_table('mb_role')
    op.drop_table('conformity')
    op.drop_table('wfs_termsofuse')
    op.drop_table('wfs')
    op.drop_table('cat_op_conf')
    op.drop_table('cat')
    op.drop_table('termsofuse')
    op.drop_index('msgid_idx', table_name='translations')
    op.drop_table('translations')
    op.drop_table('mb_log')
    op.drop_table('mb_proxy_log')
    op.drop_table('gui_category')
    op.drop_index('idx_mb_user_id', table_name='mb_user')
    op.drop_index('idx_mb_user_name', table_name='mb_user')
    op.drop_column('mb_user', 'mb_user_for_attention_of')
    op.drop_column('mb_user', 'mb_new_user_name')
    op.drop_column('mb_user', 'mb_user_resolution')
    op.drop_column('mb_user', 'mb_user_realname')
    op.drop_column('mb_user', 'mb_user_password_ticket')
    op.drop_column('mb_user', 'mb_user_reference')
    op.drop_column('mb_user', 'mb_user_phone1')
    op.drop_column('mb_user', 'mb_user_digest')
    op.drop_column('mb_user', 'mb_user_online_resource')
    op.drop_constraint('fkey_mb_user_mb_group_mb_use_id', 'mb_user_mb_group', type_='foreignkey')
    op.drop_constraint('mb_user_mb_group_ibfk_1', 'mb_user_mb_group', type_='foreignkey')
    op.create_foreign_key(None, 'mb_user_mb_group', 'mb_user', ['fkey_mb_user_id'], ['mb_user_id'])
    op.create_foreign_key(None, 'mb_user_mb_group', 'mb_group', ['fkey_mb_group_id'], ['mb_group_id'])
    op.drop_column('mb_user_mb_group', 'mb_user_mb_group_type')
    op.alter_column('mm_project_default_settings', 'mm_project_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)
    op.alter_column('mm_project_default_settings', 'mm_project_settings_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)


def downgrade():
    pass
