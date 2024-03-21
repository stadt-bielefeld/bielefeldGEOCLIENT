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
    op.execute('drop view if exists search_wfs_view;')
    op.execute('drop view if exists registrating_groups;')
    op.execute('drop table if exists gui_wms')
    op.execute('drop table if exists gui_wfs_conf')
    op.execute('drop table if exists wfs_conf_element')
    op.execute('drop table if exists wfs_conf')
    op.execute('drop table if exists wms_srs')
    op.execute('drop table if exists conformity_relation')
    op.execute('drop table if exists inspire_md_data')
    op.execute('drop table if exists layer_epsg')
    op.execute('drop table if exists ows_relation_metadata')
    op.execute('drop table if exists gui_mb_group')
    op.execute('drop table if exists layer_custom_category')
    op.execute('drop table if exists gui_gui_category')
    op.execute('drop table if exists layer_inspire_category')
    op.execute('drop table if exists wfs_featuretype_inspire_category')
    op.execute('drop table if exists wmc_inspire_category')
    op.execute('drop table if exists inspire_category')
    op.execute('drop table if exists datalink_keyword')
    op.execute('drop table if exists datalink_md_topic_category')
    op.execute('drop table if exists datalink')
    op.execute('drop table if exists wfs_featuretype_custom_category')
    op.execute('drop table if exists wmc_custom_category')
    op.execute('drop table if exists custom_category')
    op.execute('drop table if exists wfs_featuretype_md_topic_category')
    op.execute('drop table if exists wfs_featuretype_keyword')
    op.execute('drop table if exists wfs_element')
    op.execute('drop table if exists wfs_featuretype_namespace')
    op.execute('drop table if exists wfs_featuretype')
    op.execute('drop table if exists spec')
    op.execute('drop table if exists spec_classification')
    op.execute('drop index if exists ind_keyword')
    op.execute('drop table if exists layer_keyword')
    op.execute('drop table if exists wmc_keyword')
    op.execute('drop table if exists cat_keyword')
    op.execute('drop table if exists keyword')
    op.execute('drop index if exists idx_wms_id')
    op.execute('drop table if exists layer_preview')
    op.execute('drop table if exists layer_load_count')
    op.execute('drop table if exists layer_md_topic_category')
    op.execute('drop table if exists layer_style')
    op.execute('drop table if exists gui_layer')
    op.execute('drop table if exists sld_user_layer')
    op.execute('drop table if exists public.layer')
    op.execute('drop table if exists mb_user_abo_ows')
    op.execute('drop table if exists mb_wms_availability')
    op.execute('drop table if exists wms_format')
    op.execute('drop table if exists wms_md_topic_category')
    op.execute('drop table if exists wms_termsofuse')
    op.execute('drop index if exists idx_mb_monitor_status')
    op.execute('drop index if exists idx_mb_monitor_upload_id')
    op.execute('drop table if exists mb_monitor')
    op.execute('drop table if exists wms')
    op.execute('drop table if exists wmc_md_topic_category')
    op.execute('drop table if exists md_topic_category')
    op.execute('drop table if exists gui_treegde')
    op.execute('drop table if exists gui_element_vars')
    op.execute('drop table if exists gui_element')
    op.execute('drop table if exists gui_cat')
    op.execute('drop table if exists gui_mb_user')
    op.execute('drop table if exists gui_wfs')
    op.execute('drop table if exists gui_kml')
    op.execute('drop table if exists gui')
    op.execute('drop table if exists wmc_preview')
    op.execute('drop index if exists idx_fkey_wmc_serial_id')
    op.execute('drop table if exists wmc_load_count')
    op.execute('drop index if exists idx_mb_user_wmc_id')
    op.execute('drop index if exists idx_mb_user_wmc_user_id')
    op.execute('drop table if exists mb_user_wmc')
    op.execute('alter table mb_user_mb_group drop constraint if exists fkey_mb_user_mb_group_role_id')
    op.execute('drop table if exists mb_role')
    op.execute('drop table if exists conformity')
    op.execute('drop table if exists wfs_termsofuse')
    op.execute('drop table if exists wfs')
    op.execute('drop table if exists cat_op_conf')
    op.execute('drop table if exists cat')
    op.execute('drop table if exists termsofuse')
    op.execute('drop index if exists msgid_idx')
    op.execute('drop table if exists translations')
    op.execute('drop table if exists mb_log')
    op.execute('drop table if exists mb_proxy_log')
    op.execute('drop table if exists gui_category')
    op.execute('drop index if exists idx_mb_user_id')
    op.execute('drop index if exists idx_mb_user_name')
    op.execute('alter table mb_user drop column if exists mb_user_for_attention_of')
    op.execute('alter table mb_user drop column if exists mb_new_user_name')
    op.execute('alter table mb_user drop column if exists mb_user_resolution')
    op.execute('alter table mb_user drop column if exists mb_user_realname')
    op.execute('alter table mb_user drop column if exists mb_user_password_ticket')
    op.execute('alter table mb_user drop column if exists mb_user_reference')
    op.execute('alter table mb_user drop column if exists mb_user_phone1')
    op.execute('alter table mb_user drop column if exists mb_user_digest')
    op.execute('alter table mb_user drop column if exists mb_user_online_resource')
    op.execute('alter table mb_user_mb_group drop constraint if exists fkey_mb_user_mb_group_mb_use_id')
    op.execute('alter table mb_user_mb_group drop constraint if exists mb_user_mb_group_ibfk_1')
    op.create_foreign_key(None, 'mb_user_mb_group', 'mb_user', ['fkey_mb_user_id'], ['mb_user_id'])
    op.create_foreign_key(None, 'mb_user_mb_group', 'mb_group', ['fkey_mb_group_id'], ['mb_group_id'])
    op.execute('alter table mb_user_mb_group drop column if exists mb_user_mb_group_type')
    op.alter_column('mm_project_default_settings', 'mm_project_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)
    op.alter_column('mm_project_default_settings', 'mm_project_settings_id',
                    existing_type=sa.INTEGER(),
                    nullable=False)


def downgrade():
    pass
