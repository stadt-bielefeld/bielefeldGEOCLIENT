\connect mapbender;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;

-- public.alembic_version definition

-- Drop table

-- DROP TABLE public.alembic_version;

CREATE TABLE public.alembic_version (
	version_num varchar(32) NOT NULL
)
WITH (
	OIDS=TRUE
);


-- public.cat definition

-- Drop table

-- DROP TABLE public.cat;

CREATE TABLE public.cat (
	cat_id serial4 NOT NULL,
	cat_version varchar(50) NOT NULL DEFAULT ''::character varying,
	cat_title varchar(255) NOT NULL DEFAULT ''::character varying,
	cat_abstract text NULL,
	cat_upload_url varchar(255) NULL,
	fees varchar(50) NULL,
	accessconstraints text NULL,
	providername varchar(255) NULL,
	providersite varchar(255) NULL,
	individualname varchar(255) NULL,
	positionname varchar(255) NULL,
	voice varchar(255) NULL,
	facsimile varchar(255) NULL,
	deliverypoint varchar(255) NULL,
	city varchar(255) NULL,
	administrativearea varchar(255) NULL,
	postalcode varchar(255) NULL,
	country varchar(255) NULL,
	electronicmailaddress varchar(255) NULL,
	cat_getcapabilities_doc text NULL,
	cat_owner int4 NULL,
	cat_timestamp int4 NULL,
	CONSTRAINT cat_pkey PRIMARY KEY (cat_id)
)
WITH (
	OIDS=TRUE
);


-- public.conformity definition

-- Drop table

-- DROP TABLE public.conformity;

CREATE TABLE public.conformity (
	conformity_id serial4 NOT NULL,
	conformity_key varchar(255) NULL,
	fkey_spec_class_key varchar(255) NULL,
	conformity_code_en varchar(255) NULL,
	conformity_code_fr varchar(255) NULL,
	conformity_code_de varchar(255) NULL,
	conformity_symbol varchar(255) NULL,
	conformity_description_de text NULL,
	CONSTRAINT conformity_pkey PRIMARY KEY (conformity_id)
)
WITH (
	OIDS=TRUE
);


-- public.custom_category definition

-- Drop table

-- DROP TABLE public.custom_category;

CREATE TABLE public.custom_category (
	custom_category_id serial4 NOT NULL,
	custom_category_key varchar(5) NOT NULL,
	custom_category_code_en varchar(255) NULL,
	custom_category_code_de varchar(255) NULL,
	custom_category_code_fr varchar(255) NULL,
	custom_category_symbol varchar(255) NULL,
	custom_category_description_de text NULL,
	custom_category_hidden int4 NULL,
	CONSTRAINT custom_category_pkey PRIMARY KEY (custom_category_id)
)
WITH (
	OIDS=TRUE
);


-- public.gui definition

-- Drop table

-- DROP TABLE public.gui;

CREATE TABLE public.gui (
	gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_name varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_description varchar(255) NOT NULL DEFAULT ''::character varying,
	gui_public int4 NOT NULL DEFAULT 1,
	CONSTRAINT pk_gui_id PRIMARY KEY (gui_id)
)
WITH (
	OIDS=TRUE
);


-- public.gui_category definition

-- Drop table

-- DROP TABLE public.gui_category;

CREATE TABLE public.gui_category (
	category_id serial4 NOT NULL,
	category_name varchar(50) NULL,
	category_description varchar(255) NULL,
	CONSTRAINT pk_category_id PRIMARY KEY (category_id)
)
WITH (
	OIDS=TRUE
);


-- public.inspire_category definition

-- Drop table

-- DROP TABLE public.inspire_category;

CREATE TABLE public.inspire_category (
	inspire_category_id serial4 NOT NULL,
	inspire_category_key varchar(5) NOT NULL,
	inspire_category_code_en varchar(255) NULL,
	inspire_category_code_de varchar(255) NULL,
	inspire_category_code_fr varchar(255) NULL,
	inspire_category_symbol varchar(255) NULL,
	inspire_category_description_de text NULL,
	CONSTRAINT inspire_category_pkey PRIMARY KEY (inspire_category_id)
)
WITH (
	OIDS=TRUE
);


-- public.inspire_md_data definition

-- Drop table

-- DROP TABLE public.inspire_md_data;

CREATE TABLE public.inspire_md_data (
	data_id serial4 NOT NULL,
	data_time_begin int4 NULL,
	data_time_end int4 NULL,
	data_lineage text NULL,
	data_spatial_res_value varchar(255) NULL,
	data_spatial_res_type int4 NULL,
	CONSTRAINT data_id_pkey PRIMARY KEY (data_id)
)
WITH (
	OIDS=TRUE
);


-- public.keyword definition

-- Drop table

-- DROP TABLE public.keyword;

CREATE TABLE public.keyword (
	keyword_id serial4 NOT NULL,
	keyword varchar(255) NOT NULL,
	CONSTRAINT keyword_keyword_key UNIQUE (keyword),
	CONSTRAINT pk_keyword_id PRIMARY KEY (keyword_id)
)
WITH (
	OIDS=TRUE
);
CREATE INDEX ind_keyword ON public.keyword USING btree (keyword);


-- public.mb_group definition

-- Drop table

-- DROP TABLE public.mb_group;

CREATE TABLE public.mb_group (
	mb_group_id serial4 NOT NULL,
	mb_group_name varchar(50) NOT NULL DEFAULT ''::character varying,
	mb_group_owner int4 NULL,
	mb_group_description varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_title varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_ext_id int8 NULL,
	mb_group_address varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_postcode varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_city varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_stateorprovince varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_country varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_voicetelephone varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_facsimiletelephone varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_email varchar(255) NOT NULL DEFAULT ''::character varying,
	mb_group_logo_path text NOT NULL DEFAULT ''::character varying,
	mb_group_homepage varchar(255) NULL,
	CONSTRAINT pk_group_id PRIMARY KEY (mb_group_id)
)
WITH (
	OIDS=TRUE
);


-- public.mb_log definition

-- Drop table

-- DROP TABLE public.mb_log;

CREATE TABLE public.mb_log (
	id serial4 NOT NULL,
	time_client varchar(13) NULL DEFAULT 0,
	time_server varchar(13) NULL,
	time_readable varchar(50) NULL,
	mb_session varchar(50) NULL,
	gui varchar(50) NULL,
	"module" varchar(50) NULL,
	ip varchar(20) NULL,
	username varchar(50) NULL,
	userid varchar(50) NULL,
	request text NULL,
	CONSTRAINT pk_mb_log PRIMARY KEY (id)
)
WITH (
	OIDS=TRUE
);


-- public.mb_proxy_log definition

-- Drop table

-- DROP TABLE public.mb_proxy_log;

CREATE TABLE public.mb_proxy_log (
	proxy_log_timestamp timestamp NULL DEFAULT now(),
	fkey_wms_id int4 NOT NULL,
	fkey_mb_user_id int4 NOT NULL,
	request varchar(4096) NULL,
	pixel int8 NULL,
	price float4 NULL
)
WITH (
	OIDS=TRUE
);


-- public.mb_role definition

-- Drop table

-- DROP TABLE public.mb_role;

CREATE TABLE public.mb_role (
	role_id serial4 NOT NULL,
	role_name varchar(50) NULL,
	role_description varchar(255) NULL,
	role_exclude_auth int4 NOT NULL DEFAULT 0,
	CONSTRAINT role_id PRIMARY KEY (role_id)
)
WITH (
	OIDS=TRUE
);


-- public.mb_user definition

-- Drop table

-- DROP TABLE public.mb_user;

CREATE TABLE public.mb_user (
	mb_user_id serial4 NOT NULL,
	mb_user_name varchar(50) NOT NULL DEFAULT ''::character varying,
	mb_user_password varchar(50) NOT NULL DEFAULT ''::character varying,
	mb_user_owner int4 NOT NULL DEFAULT 0,
	mb_user_description varchar(255) NULL,
	mb_user_login_count int4 NOT NULL DEFAULT 0,
	mb_user_email varchar(100) NULL,
	mb_user_phone varchar(50) NULL,
	mb_user_department varchar(255) NULL,
	mb_user_resolution int4 NOT NULL DEFAULT 72,
	mb_user_organisation_name varchar(255) NULL,
	mb_user_position_name varchar(255) NULL,
	mb_user_phone1 varchar(255) NULL,
	mb_user_facsimile varchar(255) NULL,
	mb_user_delivery_point varchar(255) NULL,
	mb_user_city varchar(255) NULL,
	mb_user_postal_code int4 NULL,
	mb_user_country varchar(255) NULL,
	mb_user_online_resource varchar(255) NULL,
	mb_user_realname varchar(100) NULL,
	mb_user_street varchar(100) NULL,
	mb_user_housenumber varchar(50) NULL,
	mb_user_reference varchar(100) NULL,
	mb_user_for_attention_of varchar(100) NULL,
	mb_user_valid_from date NULL,
	mb_user_valid_to date NULL,
	mb_user_password_ticket varchar(100) NULL,
	mb_user_digest text NULL,
	mb_user_firstname varchar(255) NULL DEFAULT ''::character varying,
	mb_user_lastname varchar(255) NULL DEFAULT ''::character varying,
	mb_user_academictitle varchar(255) NULL DEFAULT ''::character varying,
	mb_user_dienstkey varchar(16) NULL,
	mb_new_user_name varchar(8) NULL,
	mb_user_active bool NULL,
	mb_user_idm_managed bool NULL,
	CONSTRAINT pk_mb_user_id PRIMARY KEY (mb_user_id)
)
WITH (
	OIDS=TRUE
);
CREATE INDEX idx_mb_user_id ON public.mb_user USING btree (mb_user_id);
CREATE INDEX idx_mb_user_name ON public.mb_user USING btree (mb_user_name);


-- public.md_topic_category definition

-- Drop table

-- DROP TABLE public.md_topic_category;

CREATE TABLE public.md_topic_category (
	md_topic_category_id serial4 NOT NULL,
	md_topic_category_code_en varchar(255) NULL,
	md_topic_category_code_de varchar(255) NULL,
	CONSTRAINT md_topic_category_pkey PRIMARY KEY (md_topic_category_id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_layers definition

-- Drop table

-- DROP TABLE public.mm_layers;

CREATE TABLE public.mm_layers (
	id serial4 NOT NULL,
	name varchar NOT NULL,
	title varchar NOT NULL,
	CONSTRAINT mm_layers_name_key UNIQUE (name),
	CONSTRAINT mm_layers_pkey PRIMARY KEY (id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_project_default_settings definition

-- Drop table

-- DROP TABLE public.mm_project_default_settings;

CREATE TABLE public.mm_project_default_settings (
	id serial4 NOT NULL,
	mm_project_id int4 NULL,
	mm_project_settings_id int4 NULL,
	mb_user_id int4 NULL,
	CONSTRAINT mm_project_default_settings_pkey PRIMARY KEY (id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_project_settings definition

-- Drop table

-- DROP TABLE public.mm_project_settings;

CREATE TABLE public.mm_project_settings (
	id serial4 NOT NULL,
	name varchar NOT NULL,
	project varchar NOT NULL,
	settings varchar NULL,
	CONSTRAINT mm_project_settings_pkey PRIMARY KEY (id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_projects definition

-- Drop table

-- DROP TABLE public.mm_projects;

CREATE TABLE public.mm_projects (
	id serial4 NOT NULL,
	name varchar NOT NULL,
	CONSTRAINT mm_projects_name_key UNIQUE (name),
	CONSTRAINT mm_projects_pkey PRIMARY KEY (id)
)
WITH (
	OIDS=TRUE
);


-- public.spec_classification definition

-- Drop table

-- DROP TABLE public.spec_classification;

CREATE TABLE public.spec_classification (
	spec_class_id serial4 NOT NULL,
	spec_class_key varchar(255) NULL,
	spec_class_code_de varchar(255) NULL,
	spec_class_code_en varchar(255) NULL,
	spec_class_code_fr varchar(255) NULL,
	spec_class_description_en text NULL,
	spec_class_description_de text NULL,
	spec_class_description_fr text NULL,
	spec_class_timestamp int4 NULL,
	CONSTRAINT spec_class_id_pkey PRIMARY KEY (spec_class_id),
	CONSTRAINT spec_classification_spec_class_key_key UNIQUE (spec_class_key)
)
WITH (
	OIDS=TRUE
);


-- public.termsofuse definition

-- Drop table

-- DROP TABLE public.termsofuse;

CREATE TABLE public.termsofuse (
	termsofuse_id int4 NOT NULL,
	name varchar(255) NULL,
	symbollink varchar(255) NULL,
	description varchar(255) NULL,
	descriptionlink varchar(255) NULL,
	CONSTRAINT termsofuse_pkey PRIMARY KEY (termsofuse_id)
)
WITH (
	OIDS=TRUE
);


-- public.translations definition

-- Drop table

-- DROP TABLE public.translations;

CREATE TABLE public.translations (
	trs_id serial4 NOT NULL,
	locale varchar(8) NULL,
	msgid varchar(512) NULL,
	msgstr varchar(512) NULL,
	CONSTRAINT translations_pkey PRIMARY KEY (trs_id)
)
WITH (
	OIDS=TRUE
);
CREATE INDEX msgid_idx ON public.translations USING btree (msgid);


-- public.wfs definition

-- Drop table

-- DROP TABLE public.wfs;

CREATE TABLE public.wfs (
	wfs_id serial4 NOT NULL,
	wfs_version varchar(50) NOT NULL DEFAULT ''::character varying,
	wfs_name varchar(255) NULL,
	wfs_title varchar(255) NOT NULL DEFAULT ''::character varying,
	wfs_abstract text NULL,
	wfs_getcapabilities varchar(255) NOT NULL DEFAULT ''::character varying,
	wfs_describefeaturetype varchar(255) NULL,
	wfs_getfeature varchar(255) NULL,
	wfs_transaction varchar(255) NULL,
	wfs_owsproxy varchar(50) NULL,
	wfs_getcapabilities_doc text NULL,
	wfs_upload_url varchar(255) NULL,
	fees text NULL,
	accessconstraints text NULL,
	individualname varchar(255) NULL,
	positionname varchar(255) NULL,
	providername varchar(255) NULL,
	city varchar(255) NULL,
	deliverypoint varchar(255) NULL,
	administrativearea varchar(255) NULL,
	postalcode varchar(255) NULL,
	voice varchar(255) NULL,
	facsimile varchar(255) NULL,
	electronicmailaddress varchar(255) NULL,
	wfs_mb_getcapabilities_doc text NULL,
	wfs_owner int4 NULL,
	wfs_timestamp int4 NULL,
	country varchar(255) NULL,
	wfs_timestamp_create int4 NULL,
	wfs_network_access int4 NULL,
	fkey_mb_group_id int4 NULL,
	uuid uuid NULL,
	CONSTRAINT pk_wfs_id PRIMARY KEY (wfs_id)
)
WITH (
	OIDS=TRUE
);


-- public.wms definition

-- Drop table

-- DROP TABLE public.wms;

CREATE TABLE public.wms (
	wms_id serial4 NOT NULL,
	wms_version varchar(50) NOT NULL DEFAULT ''::character varying,
	wms_title varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_abstract text NULL,
	wms_getcapabilities varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_getmap varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_getfeatureinfo varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_getlegendurl varchar(255) NULL,
	wms_filter varchar(255) NULL,
	wms_getcapabilities_doc text NULL,
	wms_owsproxy varchar(50) NULL,
	wms_upload_url varchar(255) NULL,
	fees text NULL,
	accessconstraints text NULL,
	contactperson varchar(255) NULL,
	contactposition varchar(255) NULL,
	contactorganization varchar(255) NULL,
	address varchar(255) NULL,
	city varchar(255) NULL,
	stateorprovince varchar(255) NULL,
	postcode varchar(255) NULL,
	country varchar(255) NULL,
	contactvoicetelephone varchar(255) NULL,
	contactfacsimiletelephone varchar(255) NULL,
	contactelectronicmailaddress varchar(255) NULL,
	wms_mb_getcapabilities_doc text NULL,
	wms_owner int4 NULL,
	wms_timestamp int4 NULL,
	wms_supportsld bool NULL,
	wms_userlayer bool NULL,
	wms_userstyle bool NULL,
	wms_remotewfs bool NULL,
	wms_proxylog int4 NULL,
	wms_pricevolume int4 NULL,
	wms_username varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_password varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_auth_type varchar(255) NOT NULL DEFAULT ''::character varying,
	wms_timestamp_create int4 NULL,
	wms_network_access int4 NULL,
	fkey_mb_group_id int4 NULL,
	uuid uuid NULL,
	CONSTRAINT pk_wms_id PRIMARY KEY (wms_id)
)
WITH (
	OIDS=TRUE
);
CREATE INDEX idx_wms_id ON public.wms USING btree (wms_id);


-- public.cat_keyword definition

-- Drop table

-- DROP TABLE public.cat_keyword;

CREATE TABLE public.cat_keyword (
	fkey_cat_id int4 NOT NULL,
	fkey_keyword_id int4 NOT NULL,
	CONSTRAINT pk_cat_keyword PRIMARY KEY (fkey_cat_id, fkey_keyword_id),
	CONSTRAINT fkey_cat_id_fkey_keyword_id FOREIGN KEY (fkey_cat_id) REFERENCES public.cat(cat_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_keyword_id_fkey_cat_id FOREIGN KEY (fkey_keyword_id) REFERENCES public.keyword(keyword_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.cat_op_conf definition

-- Drop table

-- DROP TABLE public.cat_op_conf;

CREATE TABLE public.cat_op_conf (
	fk_cat_id int4 NOT NULL,
	param_name varchar(255) NOT NULL,
	param_value text NOT NULL,
	param_type varchar(255) NOT NULL,
	CONSTRAINT pk_con_cat_op PRIMARY KEY (fk_cat_id, param_type, param_name, param_value),
	CONSTRAINT fk_cat_conf_to_cat FOREIGN KEY (fk_cat_id) REFERENCES public.cat(cat_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.datalink definition

-- Drop table

-- DROP TABLE public.datalink;

CREATE TABLE public.datalink (
	datalink_id serial4 NOT NULL,
	datalink_type varchar(50) NOT NULL DEFAULT ''::character varying,
	datalink_type_version varchar(50) NOT NULL DEFAULT ''::character varying,
	datalink_url text NULL,
	datalink_owner int4 NULL,
	datalink_timestamp int4 NULL,
	datalink_timestamp_create int4 NULL,
	datalink_timestamp_last_usage int4 NULL,
	datalink_abstract text NULL,
	datalink_title varchar(255) NOT NULL DEFAULT ''::character varying,
	datalink_data text NULL,
	datalink_network_access int4 NULL,
	datalink_owsproxy varchar(50) NULL,
	fees varchar(255) NULL,
	accessconstraints text NULL,
	crs varchar(50) NOT NULL DEFAULT ''::character varying,
	minx float8 NULL DEFAULT 0,
	miny float8 NULL DEFAULT 0,
	maxx float8 NULL DEFAULT 0,
	maxy float8 NULL DEFAULT 0,
	CONSTRAINT pk_datalink_id PRIMARY KEY (datalink_id),
	CONSTRAINT datalink_owner_fkey FOREIGN KEY (datalink_owner) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.datalink_keyword definition

-- Drop table

-- DROP TABLE public.datalink_keyword;

CREATE TABLE public.datalink_keyword (
	fkey_datalink_id int4 NOT NULL,
	fkey_keyword_id int4 NOT NULL,
	CONSTRAINT pk_datalink_keyword PRIMARY KEY (fkey_datalink_id, fkey_keyword_id),
	CONSTRAINT fkey_datalink_id_fkey_keyword_id FOREIGN KEY (fkey_datalink_id) REFERENCES public.datalink(datalink_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_keyword_id_fkey_datalink_id FOREIGN KEY (fkey_keyword_id) REFERENCES public.keyword(keyword_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.datalink_md_topic_category definition

-- Drop table

-- DROP TABLE public.datalink_md_topic_category;

CREATE TABLE public.datalink_md_topic_category (
	fkey_datalink_id int4 NOT NULL,
	fkey_md_topic_category_id int4 NOT NULL,
	CONSTRAINT datalink_md_topic_category_fkey_datalink_id_fkey FOREIGN KEY (fkey_datalink_id) REFERENCES public.datalink(datalink_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT datalink_md_topic_category_fkey_md_topic_category_id_fkey FOREIGN KEY (fkey_md_topic_category_id) REFERENCES public.md_topic_category(md_topic_category_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_cat definition

-- Drop table

-- DROP TABLE public.gui_cat;

CREATE TABLE public.gui_cat (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_cat_id int4 NOT NULL DEFAULT 0,
	CONSTRAINT fkey_cat_cat_id FOREIGN KEY (fkey_cat_id) REFERENCES public.cat(cat_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_cat_gui_id FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_element definition

-- Drop table

-- DROP TABLE public.gui_element;

CREATE TABLE public.gui_element (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	e_id varchar(50) NOT NULL DEFAULT ''::character varying,
	e_pos int4 NOT NULL DEFAULT 2,
	e_public int4 NOT NULL DEFAULT 1,
	e_comment text NULL,
	e_title varchar(255) NULL,
	e_element varchar(255) NOT NULL DEFAULT ''::character varying,
	e_src varchar(255) NULL,
	e_attributes text NULL,
	e_left int4 NULL,
	e_top int4 NULL,
	e_width int4 NULL,
	e_height int4 NULL,
	e_z_index int4 NULL,
	e_more_styles text NULL,
	e_content text NULL,
	e_closetag varchar(255) NULL,
	e_js_file varchar(255) NULL,
	e_mb_mod varchar(255) NULL,
	e_target varchar(255) NULL,
	e_requires varchar(255) NULL,
	e_url varchar(255) NULL,
	CONSTRAINT pk_fkey_gui_id PRIMARY KEY (fkey_gui_id, e_id),
	CONSTRAINT gui_element_ibfk1 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_element_vars definition

-- Drop table

-- DROP TABLE public.gui_element_vars;

CREATE TABLE public.gui_element_vars (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_e_id varchar(50) NOT NULL DEFAULT ''::character varying,
	var_name varchar(50) NOT NULL DEFAULT ''::character varying,
	var_value text NULL,
	context text NULL,
	var_type varchar(50) NULL,
	CONSTRAINT pk_fkey_gui_id_fkey_e_id_var_name PRIMARY KEY (fkey_gui_id, fkey_e_id, var_name),
	CONSTRAINT gui_element_vars_ibfk1 FOREIGN KEY (fkey_gui_id,fkey_e_id) REFERENCES public.gui_element(fkey_gui_id,e_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_gui_category definition

-- Drop table

-- DROP TABLE public.gui_gui_category;

CREATE TABLE public.gui_gui_category (
	fkey_gui_id varchar(50) NOT NULL,
	fkey_gui_category_id int4 NOT NULL,
	CONSTRAINT pk_gui_gui_category PRIMARY KEY (fkey_gui_id, fkey_gui_category_id),
	CONSTRAINT gui_gui_category_ibfk_1 FOREIGN KEY (fkey_gui_category_id) REFERENCES public.gui_category(category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_gui_category_ibfk_2 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_kml definition

-- Drop table

-- DROP TABLE public.gui_kml;

CREATE TABLE public.gui_kml (
	kml_id serial4 NOT NULL,
	fkey_mb_user_id int4 NOT NULL,
	fkey_gui_id varchar(50) NOT NULL,
	kml_doc text NOT NULL,
	kml_name varchar(64) NULL,
	kml_description text NULL,
	kml_timestamp int4 NOT NULL,
	CONSTRAINT mb_gui_kml_pkey PRIMARY KEY (kml_id),
	CONSTRAINT gui_kml_fkey_mb_user_id FOREIGN KEY (fkey_mb_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_kml_id_fkey_gui_id FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_mb_group definition

-- Drop table

-- DROP TABLE public.gui_mb_group;

CREATE TABLE public.gui_mb_group (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_mb_group_id int4 NOT NULL DEFAULT 0,
	mb_group_type varchar(50) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_fkey_mb_group_id PRIMARY KEY (fkey_mb_group_id, fkey_gui_id),
	CONSTRAINT gui_mb_group_ibfk_1 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_mb_group_ibfk_2 FOREIGN KEY (fkey_mb_group_id) REFERENCES public.mb_group(mb_group_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_mb_user definition

-- Drop table

-- DROP TABLE public.gui_mb_user;

CREATE TABLE public.gui_mb_user (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_mb_user_id int4 NOT NULL DEFAULT 0,
	mb_user_type varchar(50) NULL,
	CONSTRAINT pk_fkey_mb_user_id PRIMARY KEY (fkey_gui_id, fkey_mb_user_id),
	CONSTRAINT gui_mb_user_ibfk_1 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_mb_user_ibfk_2 FOREIGN KEY (fkey_mb_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_treegde definition

-- Drop table

-- DROP TABLE public.gui_treegde;

CREATE TABLE public.gui_treegde (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_layer_id text NULL,
	id serial4 NOT NULL,
	lft int4 NOT NULL DEFAULT 0,
	rgt int4 NOT NULL DEFAULT 0,
	my_layer_title varchar(50) NULL,
	layer text NULL,
	wms_id text NULL,
	CONSTRAINT pk_fkey_treegde_id PRIMARY KEY (fkey_gui_id, id, lft, rgt),
	CONSTRAINT gui_treegde_ibfk_1 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_wfs definition

-- Drop table

-- DROP TABLE public.gui_wfs;

CREATE TABLE public.gui_wfs (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_wfs_id int4 NOT NULL DEFAULT 0,
	CONSTRAINT gui_wfs_ibfk_3 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_wfs_ibfk_4 FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_wms definition

-- Drop table

-- DROP TABLE public.gui_wms;

CREATE TABLE public.gui_wms (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_wms_id int4 NOT NULL DEFAULT 0,
	gui_wms_position int4 NOT NULL DEFAULT 0,
	gui_wms_mapformat varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_wms_featureinfoformat varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_wms_exceptionformat varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_wms_epsg varchar(50) NOT NULL DEFAULT ''::character varying,
	gui_wms_visible int4 NOT NULL DEFAULT 1,
	gui_wms_sldurl varchar(255) NOT NULL DEFAULT ''::character varying,
	gui_wms_opacity int4 NULL DEFAULT 100,
	CONSTRAINT pk_gui_wms PRIMARY KEY (fkey_gui_id, fkey_wms_id),
	CONSTRAINT gui_wms_ibfk_3 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_wms_ibfk_4 FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer definition

-- Drop table

-- DROP TABLE public.layer;

CREATE TABLE public.layer (
	layer_id serial4 NOT NULL,
	fkey_wms_id int4 NOT NULL DEFAULT 0,
	layer_pos int4 NOT NULL DEFAULT 0,
	layer_parent varchar(50) NOT NULL DEFAULT ''::character varying,
	layer_name varchar(255) NOT NULL DEFAULT ''::character varying,
	layer_title varchar(255) NOT NULL DEFAULT ''::character varying,
	layer_queryable int4 NOT NULL DEFAULT 0,
	layer_minscale int4 NULL DEFAULT 0,
	layer_maxscale int4 NULL DEFAULT 0,
	layer_dataurl varchar(255) NULL,
	layer_metadataurl varchar(255) NULL,
	layer_abstract text NULL,
	layer_searchable int4 NULL DEFAULT 1,
	uuid uuid NULL,
	CONSTRAINT pk_layer_id PRIMARY KEY (layer_id),
	CONSTRAINT layer_ibfk_1 FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_custom_category definition

-- Drop table

-- DROP TABLE public.layer_custom_category;

CREATE TABLE public.layer_custom_category (
	fkey_layer_id int4 NOT NULL,
	fkey_custom_category_id int4 NOT NULL,
	CONSTRAINT layer_custom_category_fkey_custom_category_id_fkey FOREIGN KEY (fkey_custom_category_id) REFERENCES public.custom_category(custom_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT layer_custom_category_fkey_layer_id_fkey FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_epsg definition

-- Drop table

-- DROP TABLE public.layer_epsg;

CREATE TABLE public.layer_epsg (
	fkey_layer_id int4 NOT NULL DEFAULT 0,
	epsg varchar(50) NOT NULL DEFAULT ''::character varying,
	minx float8 NULL DEFAULT 0,
	miny float8 NULL DEFAULT 0,
	maxx float8 NULL DEFAULT 0,
	maxy float8 NULL DEFAULT 0,
	CONSTRAINT layer_epsg_ibfk_1 FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_inspire_category definition

-- Drop table

-- DROP TABLE public.layer_inspire_category;

CREATE TABLE public.layer_inspire_category (
	fkey_layer_id int4 NOT NULL,
	fkey_inspire_category_id int4 NOT NULL,
	CONSTRAINT layer_inspire_category_fkey_inspire_category_id_fkey FOREIGN KEY (fkey_inspire_category_id) REFERENCES public.inspire_category(inspire_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT layer_inspire_category_fkey_layer_id_fkey FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_keyword definition

-- Drop table

-- DROP TABLE public.layer_keyword;

CREATE TABLE public.layer_keyword (
	fkey_layer_id int4 NOT NULL,
	fkey_keyword_id int4 NOT NULL,
	CONSTRAINT pk_layer_keyword PRIMARY KEY (fkey_layer_id, fkey_keyword_id),
	CONSTRAINT fkey_keyword_id_fkey_layer_id FOREIGN KEY (fkey_keyword_id) REFERENCES public.keyword(keyword_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_layer_id_fkey_keyword_id FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_load_count definition

-- Drop table

-- DROP TABLE public.layer_load_count;

CREATE TABLE public.layer_load_count (
	fkey_layer_id int4 NULL,
	load_count int8 NULL,
	CONSTRAINT layer_load_count_fkey_layer_id_fkey FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_md_topic_category definition

-- Drop table

-- DROP TABLE public.layer_md_topic_category;

CREATE TABLE public.layer_md_topic_category (
	fkey_layer_id int4 NOT NULL,
	fkey_md_topic_category_id int4 NOT NULL,
	CONSTRAINT layer_md_topic_category_fkey_layer_id_fkey FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT layer_md_topic_category_fkey_md_topic_category_id_fkey FOREIGN KEY (fkey_md_topic_category_id) REFERENCES public.md_topic_category(md_topic_category_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_preview definition

-- Drop table

-- DROP TABLE public.layer_preview;

CREATE TABLE public.layer_preview (
	fkey_layer_id int4 NOT NULL,
	layer_map_preview_filename varchar(100) NULL,
	layer_extent_preview_filename varchar(100) NULL,
	layer_legend_preview_filename varchar(100) NULL,
	CONSTRAINT layer_preview_fkey_layer_id_key UNIQUE (fkey_layer_id),
	CONSTRAINT fkey_layer_id FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.layer_style definition

-- Drop table

-- DROP TABLE public.layer_style;

CREATE TABLE public.layer_style (
	fkey_layer_id int4 NOT NULL DEFAULT 0,
	name varchar(50) NOT NULL DEFAULT ''::character varying,
	title varchar(100) NOT NULL DEFAULT ''::character varying,
	legendurl varchar(255) NULL,
	legendurlformat varchar(50) NULL,
	CONSTRAINT layer_style_ibfk_1 FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.mb_monitor definition

-- Drop table

-- DROP TABLE public.mb_monitor;

CREATE TABLE public.mb_monitor (
	upload_id varchar(255) NOT NULL DEFAULT ''::character varying,
	fkey_wms_id int4 NOT NULL DEFAULT 0,
	status int4 NOT NULL,
	status_comment varchar(255) NOT NULL DEFAULT ''::character varying,
	timestamp_begin int4 NOT NULL,
	timestamp_end int4 NOT NULL,
	upload_url varchar(255) NOT NULL DEFAULT ''::character varying,
	updated bpchar(1) NOT NULL DEFAULT ''::bpchar,
	image int4 NULL,
	map_url varchar(2048) NULL,
	cap_diff text NULL DEFAULT ''::text,
	CONSTRAINT pk_mb_monitor PRIMARY KEY (upload_id, fkey_wms_id),
	CONSTRAINT fkey_monitor_wms_id_wms_id FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);
CREATE INDEX idx_mb_monitor_status ON public.mb_monitor USING btree (status);
CREATE INDEX idx_mb_monitor_upload_id ON public.mb_monitor USING btree (upload_id);

-- public.mb_user_abo_ows definition

-- Drop table

-- DROP TABLE public.mb_user_abo_ows;

CREATE TABLE public.mb_user_abo_ows (
	fkey_mb_user_id int4 NULL,
	fkey_wms_id int4 NULL,
	fkey_wfs_id int4 NULL,
	CONSTRAINT mb_user_abo_ows_user_id_fkey FOREIGN KEY (fkey_mb_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mb_user_abo_ows_wfs_fkey FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mb_user_abo_ows_wms_fkey FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.mb_user_mb_group definition

-- Drop table

-- DROP TABLE public.mb_user_mb_group;

CREATE TABLE public.mb_user_mb_group (
	fkey_mb_user_id int4 NOT NULL DEFAULT 0,
	fkey_mb_group_id int4 NOT NULL DEFAULT 0,
	mb_user_mb_group_type int4 NOT NULL DEFAULT 1,
	CONSTRAINT pk_fkey_mb_user_mb_group_id PRIMARY KEY (fkey_mb_user_id, fkey_mb_group_id, mb_user_mb_group_type),
	CONSTRAINT fkey_mb_user_mb_group_mb_use_id FOREIGN KEY (fkey_mb_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_mb_user_mb_group_role_id FOREIGN KEY (mb_user_mb_group_type) REFERENCES public.mb_role(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mb_user_mb_group_ibfk_1 FOREIGN KEY (fkey_mb_group_id) REFERENCES public.mb_group(mb_group_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.mb_user_wmc definition

-- Drop table

-- DROP TABLE public.mb_user_wmc;

CREATE TABLE public.mb_user_wmc (
	wmc_id varchar(20) NOT NULL DEFAULT ''::character varying,
	fkey_user_id int4 NOT NULL DEFAULT 0,
	wmc text NOT NULL,
	wmc_title varchar(50) NULL,
	wmc_timestamp int4 NULL,
	wmc_serial_id serial4 NOT NULL,
	wmc_timestamp_create int4 NULL,
	wmc_public int4 NOT NULL DEFAULT 0,
	abstract text NULL,
	srs varchar NULL,
	minx float8 NULL DEFAULT 0,
	miny float8 NULL DEFAULT 0,
	maxx float8 NULL DEFAULT 0,
	maxy float8 NULL DEFAULT 0,
	CONSTRAINT pk_user_wmc PRIMARY KEY (wmc_serial_id),
	CONSTRAINT mb_user_wmc_ibfk_1 FOREIGN KEY (fkey_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);
CREATE INDEX idx_mb_user_wmc_id ON public.mb_user_wmc USING btree (wmc_id);
CREATE INDEX idx_mb_user_wmc_user_id ON public.mb_user_wmc USING btree (fkey_user_id);


-- public.mb_wms_availability definition

-- Drop table

-- DROP TABLE public.mb_wms_availability;

CREATE TABLE public.mb_wms_availability (
	fkey_wms_id int4 NULL,
	fkey_upload_id varchar NULL,
	last_status int4 NULL,
	availability float4 NULL,
	image int4 NULL,
	status_comment varchar NULL,
	average_resp_time float4 NULL,
	upload_url varchar NULL,
	map_url varchar NULL,
	cap_diff text NULL DEFAULT ''::text,
	CONSTRAINT mb_wms_availability_fkey_wms_id_wms_id FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.mm_layer_group definition

-- Drop table

-- DROP TABLE public.mm_layer_group;

CREATE TABLE public.mm_layer_group (
	mm_layer_id int4 NULL,
	mb_group_id int4 NULL,
	CONSTRAINT mm_layer_group_mb_group_id_fkey FOREIGN KEY (mb_group_id) REFERENCES public.mb_group(mb_group_id),
	CONSTRAINT mm_layer_group_mm_layer_id_fkey FOREIGN KEY (mm_layer_id) REFERENCES public.mm_layers(id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_project_group definition

-- Drop table

-- DROP TABLE public.mm_project_group;

CREATE TABLE public.mm_project_group (
	mm_project_id int4 NULL,
	mb_group_id int4 NULL,
	CONSTRAINT mm_project_group_mb_group_id_fkey FOREIGN KEY (mb_group_id) REFERENCES public.mb_group(mb_group_id),
	CONSTRAINT mm_project_group_mm_project_id_fkey FOREIGN KEY (mm_project_id) REFERENCES public.mm_projects(id)
)
WITH (
	OIDS=TRUE
);


-- public.mm_project_settings_user definition

-- Drop table

-- DROP TABLE public.mm_project_settings_user;

CREATE TABLE public.mm_project_settings_user (
	mm_project_settings_id int4 NULL,
	mb_user_id int4 NULL,
	CONSTRAINT mm_project_settings_user_mb_user_id_fkey FOREIGN KEY (mb_user_id) REFERENCES public.mb_user(mb_user_id),
	CONSTRAINT mm_project_settings_user_mm_project_settings_id_fkey FOREIGN KEY (mm_project_settings_id) REFERENCES public.mm_project_settings(id)
)
WITH (
	OIDS=TRUE
);


-- public.password_recovery definition

-- Drop table

-- DROP TABLE public.password_recovery;

CREATE TABLE public.password_recovery (
	id serial4 NOT NULL,
	hash varchar NOT NULL,
	user_id int4 NULL,
	valid_till timestamp NULL,
	CONSTRAINT password_recovery_hash_key UNIQUE (hash),
	CONSTRAINT password_recovery_pkey PRIMARY KEY (id),
	CONSTRAINT password_recovery_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.mb_user(mb_user_id)
)
WITH (
	OIDS=TRUE
);


-- public.sld_user_layer definition

-- Drop table

-- DROP TABLE public.sld_user_layer;

CREATE TABLE public.sld_user_layer (
	sld_user_layer_id serial4 NOT NULL,
	fkey_mb_user_id int4 NOT NULL,
	fkey_layer_id int4 NOT NULL,
	fkey_gui_id varchar NULL,
	sld_xml text NULL,
	use_sld int2 NULL,
	CONSTRAINT pk_sld_user_layer PRIMARY KEY (sld_user_layer_id),
	CONSTRAINT sld_user_layer_ibfk_1 FOREIGN KEY (fkey_mb_user_id) REFERENCES public.mb_user(mb_user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT sld_user_layer_ibfk_2 FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT sld_user_layer_ibfk_3 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.spec definition

-- Drop table

-- DROP TABLE public.spec;

CREATE TABLE public.spec (
	spec_id serial4 NOT NULL,
	spec_key varchar(50) NOT NULL,
	spec_code_en varchar NULL,
	spec_code_de varchar NULL,
	spec_code_fr varchar NULL,
	spec_link_en varchar NULL,
	spec_link_de varchar NULL,
	spec_link_fr varchar NULL,
	spec_description_en text NULL,
	spec_description_de text NULL,
	spec_description_fr text NULL,
	fkey_spec_class_key varchar(255) NULL,
	spec_timestamp int4 NULL,
	CONSTRAINT spec_id_pkey PRIMARY KEY (spec_id),
	CONSTRAINT spec_spec_class_fkey FOREIGN KEY (fkey_spec_class_key) REFERENCES public.spec_classification(spec_class_key) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype definition

-- Drop table

-- DROP TABLE public.wfs_featuretype;

CREATE TABLE public.wfs_featuretype (
	fkey_wfs_id int4 NOT NULL DEFAULT 0,
	featuretype_id serial4 NOT NULL,
	featuretype_name varchar(255) NOT NULL DEFAULT ''::character varying,
	featuretype_title varchar(255) NULL,
	featuretype_srs varchar(50) NULL,
	featuretype_searchable int4 NULL DEFAULT 1,
	featuretype_abstract text NULL,
	uuid uuid NULL,
	CONSTRAINT pk_featuretype_id PRIMARY KEY (featuretype_id),
	CONSTRAINT wfs_featuretype_ibfk_1 FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype_custom_category definition

-- Drop table

-- DROP TABLE public.wfs_featuretype_custom_category;

CREATE TABLE public.wfs_featuretype_custom_category (
	fkey_featuretype_id int4 NOT NULL,
	fkey_custom_category_id int4 NOT NULL,
	CONSTRAINT wfs_featuretype_custom_category_fkey_custom_category_id_fkey FOREIGN KEY (fkey_custom_category_id) REFERENCES public.custom_category(custom_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_featuretype_custom_category_fkey_featuretype_id_fkey FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype_inspire_category definition

-- Drop table

-- DROP TABLE public.wfs_featuretype_inspire_category;

CREATE TABLE public.wfs_featuretype_inspire_category (
	fkey_featuretype_id int4 NOT NULL,
	fkey_inspire_category_id int4 NOT NULL,
	CONSTRAINT wfs_featuretype_inspire_category_fkey_featuretype_id_fkey FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_featuretype_inspire_category_fkey_inspire_category_id_fkey FOREIGN KEY (fkey_inspire_category_id) REFERENCES public.inspire_category(inspire_category_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype_keyword definition

-- Drop table

-- DROP TABLE public.wfs_featuretype_keyword;

CREATE TABLE public.wfs_featuretype_keyword (
	fkey_featuretype_id int4 NOT NULL,
	fkey_keyword_id int4 NOT NULL,
	CONSTRAINT fkey_featuretype_id_fkey_keyword_id FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fkey_keyword_id_fkey_featuretype_id FOREIGN KEY (fkey_keyword_id) REFERENCES public.keyword(keyword_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype_md_topic_category definition

-- Drop table

-- DROP TABLE public.wfs_featuretype_md_topic_category;

CREATE TABLE public.wfs_featuretype_md_topic_category (
	fkey_featuretype_id int4 NOT NULL,
	fkey_md_topic_category_id int4 NOT NULL,
	CONSTRAINT wfs_featuretype_md_topic_category_fkey_featuretype_id_fkey FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_featuretype_md_topic_category_fkey_md_topic_cat_id_fkey FOREIGN KEY (fkey_md_topic_category_id) REFERENCES public.md_topic_category(md_topic_category_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_featuretype_namespace definition

-- Drop table

-- DROP TABLE public.wfs_featuretype_namespace;

CREATE TABLE public.wfs_featuretype_namespace (
	fkey_wfs_id int4 NOT NULL DEFAULT 0,
	fkey_featuretype_id int4 NOT NULL DEFAULT 0,
	"namespace" varchar(255) NOT NULL DEFAULT ''::character varying,
	namespace_location varchar(255) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_featuretype_namespace PRIMARY KEY (fkey_wfs_id, fkey_featuretype_id, namespace),
	CONSTRAINT wfs_featuretype_namespace_ibfk_1 FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_featuretype_namespace_ibfk_2 FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_termsofuse definition

-- Drop table

-- DROP TABLE public.wfs_termsofuse;

CREATE TABLE public.wfs_termsofuse (
	fkey_wfs_id int4 NULL,
	fkey_termsofuse_id int4 NULL,
	CONSTRAINT wfs_termsofuse_fkey_wfs_id_fkey FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_termsofuse_termsofuse_fkey FOREIGN KEY (fkey_termsofuse_id) REFERENCES public.termsofuse(termsofuse_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wmc_custom_category definition

-- Drop table

-- DROP TABLE public.wmc_custom_category;

CREATE TABLE public.wmc_custom_category (
	fkey_wmc_serial_id int4 NOT NULL,
	fkey_custom_category_id int4 NOT NULL,
	CONSTRAINT wmc_custom_category_fkey_custom_category_id_fkey FOREIGN KEY (fkey_custom_category_id) REFERENCES public.custom_category(custom_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wmc_custom_category_fkey_wmc_serial_id_fkey FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wmc_inspire_category definition

-- Drop table

-- DROP TABLE public.wmc_inspire_category;

CREATE TABLE public.wmc_inspire_category (
	fkey_wmc_serial_id int4 NOT NULL,
	fkey_inspire_category_id int4 NOT NULL,
	CONSTRAINT wmc_inspire_category_fkey_inspire_category_id_fkey FOREIGN KEY (fkey_inspire_category_id) REFERENCES public.inspire_category(inspire_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wmc_inspire_category_fkey_wmc_serial_id_fkey FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wmc_keyword definition

-- Drop table

-- DROP TABLE public.wmc_keyword;

CREATE TABLE public.wmc_keyword (
	fkey_keyword_id int4 NOT NULL,
	fkey_wmc_serial_id int4 NOT NULL,
	CONSTRAINT pk_wmc_keyword PRIMARY KEY (fkey_wmc_serial_id, fkey_keyword_id),
	CONSTRAINT wmc_keyword_fkey_keyword_id_fkey FOREIGN KEY (fkey_keyword_id) REFERENCES public.keyword(keyword_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wmc_keyword_fkey_wmc_serial_id_fkey FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wmc_load_count definition

-- Drop table

-- DROP TABLE public.wmc_load_count;

CREATE TABLE public.wmc_load_count (
	fkey_wmc_serial_id int4 NULL,
	load_count int8 NULL,
	CONSTRAINT wmc_load_count_fkey_wmc_serial_id_fkey FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);
CREATE INDEX idx_fkey_wmc_serial_id ON public.wmc_load_count USING btree (fkey_wmc_serial_id);


-- public.wmc_md_topic_category definition

-- Drop table

-- DROP TABLE public.wmc_md_topic_category;

CREATE TABLE public.wmc_md_topic_category (
	fkey_wmc_serial_id int4 NOT NULL,
	fkey_md_topic_category_id int4 NOT NULL,
	CONSTRAINT wmc_topic_category_fkey_md_topic_category_id_fkey FOREIGN KEY (fkey_md_topic_category_id) REFERENCES public.md_topic_category(md_topic_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wmc_topic_category_fkey_wmc_serial_id_fkey FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wmc_preview definition

-- Drop table

-- DROP TABLE public.wmc_preview;

CREATE TABLE public.wmc_preview (
	fkey_wmc_serial_id int4 NOT NULL,
	wmc_preview_filename varchar(100) NULL,
	CONSTRAINT wmc_fkey_layer_id_key UNIQUE (fkey_wmc_serial_id),
	CONSTRAINT c_fkey_wmc_serial_id FOREIGN KEY (fkey_wmc_serial_id) REFERENCES public.mb_user_wmc(wmc_serial_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wms_format definition

-- Drop table

-- DROP TABLE public.wms_format;

CREATE TABLE public.wms_format (
	fkey_wms_id int4 NOT NULL DEFAULT 0,
	data_type varchar(50) NOT NULL DEFAULT ''::character varying,
	data_format varchar(100) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_wms_format PRIMARY KEY (fkey_wms_id, data_type, data_format),
	CONSTRAINT wms_format_ibfk_1 FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wms_md_topic_category definition

-- Drop table

-- DROP TABLE public.wms_md_topic_category;

CREATE TABLE public.wms_md_topic_category (
	fkey_wms_id int4 NOT NULL,
	fkey_md_topic_category_id int4 NOT NULL,
	CONSTRAINT pk_md_topic_category PRIMARY KEY (fkey_wms_id, fkey_md_topic_category_id),
	CONSTRAINT wms_md_topic_category_fkey_md_topic_category_id_fkey FOREIGN KEY (fkey_md_topic_category_id) REFERENCES public.md_topic_category(md_topic_category_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wms_md_topic_category_fkey_wms_id_fkey FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wms_srs definition

-- Drop table

-- DROP TABLE public.wms_srs;

CREATE TABLE public.wms_srs (
	fkey_wms_id int4 NOT NULL DEFAULT 0,
	wms_srs varchar(50) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_wms_srs PRIMARY KEY (fkey_wms_id, wms_srs),
	CONSTRAINT wms_srs_ibfk_1 FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wms_termsofuse definition

-- Drop table

-- DROP TABLE public.wms_termsofuse;

CREATE TABLE public.wms_termsofuse (
	fkey_wms_id int4 NULL,
	fkey_termsofuse_id int4 NULL,
	CONSTRAINT wms_termsofuse_termsofuse_fkey FOREIGN KEY (fkey_termsofuse_id) REFERENCES public.termsofuse(termsofuse_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wms_termsofuse_wms_fkey FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.conformity_relation definition

-- Drop table

-- DROP TABLE public.conformity_relation;

CREATE TABLE public.conformity_relation (
	relation_id serial4 NOT NULL,
	fkey_wms_id int4 NULL,
	fkey_wfs_id int4 NULL,
	fkey_inspire_md_id int4 NULL,
	fkey_conformity_id int4 NULL,
	fkey_spec_id int4 NULL,
	CONSTRAINT relation_id_pkey PRIMARY KEY (relation_id),
	CONSTRAINT conformity_relation_conformity_fkey FOREIGN KEY (fkey_conformity_id) REFERENCES public.conformity(conformity_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT conformity_relation_inspire_md_fkey FOREIGN KEY (fkey_inspire_md_id) REFERENCES public.inspire_md_data(data_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT conformity_relation_spec_fkey FOREIGN KEY (fkey_spec_id) REFERENCES public.spec(spec_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT conformity_relation_wfs_id_fkey FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT conformity_relation_wms_id_fkey FOREIGN KEY (fkey_wms_id) REFERENCES public.wms(wms_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_layer definition

-- Drop table

-- DROP TABLE public.gui_layer;

CREATE TABLE public.gui_layer (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_layer_id int4 NOT NULL DEFAULT 0,
	gui_layer_wms_id int4 NULL DEFAULT 0,
	gui_layer_status int4 NULL DEFAULT 1,
	gui_layer_selectable int4 NULL DEFAULT 1,
	gui_layer_visible int4 NULL DEFAULT 1,
	gui_layer_queryable int4 NULL DEFAULT 0,
	gui_layer_querylayer int4 NULL DEFAULT 0,
	gui_layer_minscale int4 NULL DEFAULT 0,
	gui_layer_maxscale int4 NULL DEFAULT 0,
	gui_layer_priority int4 NULL,
	gui_layer_style varchar(50) NULL,
	gui_layer_wfs_featuretype varchar(50) NULL,
	gui_layer_title varchar(255) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_gui_layer PRIMARY KEY (fkey_gui_id, fkey_layer_id),
	CONSTRAINT pk_gui_layer_ifbk3 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT pk_gui_layer_ifbk4 FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.ows_relation_metadata definition

-- Drop table

-- DROP TABLE public.ows_relation_metadata;

CREATE TABLE public.ows_relation_metadata (
	fkey_metadata_id int4 NOT NULL,
	fkey_layer_id int4 NULL,
	fkey_featuretype_id int4 NULL,
	CONSTRAINT ows_relation_metadata_fkey_featuretype_id_fkey FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT ows_relation_metadata_fkey_layer_id_fkey FOREIGN KEY (fkey_layer_id) REFERENCES public.layer(layer_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_conf definition

-- Drop table

-- DROP TABLE public.wfs_conf;

CREATE TABLE public.wfs_conf (
	wfs_conf_id serial4 NOT NULL,
	wfs_conf_abstract text NULL,
	fkey_wfs_id int4 NOT NULL DEFAULT 0,
	fkey_featuretype_id int4 NOT NULL DEFAULT 0,
	g_label varchar(50) NULL,
	g_label_id varchar(50) NULL,
	g_button varchar(50) NULL,
	g_button_id varchar(50) NULL,
	g_style text NULL,
	g_buffer float8 NULL DEFAULT 0,
	g_res_style text NULL,
	g_use_wzgraphics int4 NULL DEFAULT 0,
	wfs_conf_description text NULL,
	wfs_conf_type int4 NOT NULL DEFAULT 0,
	CONSTRAINT pk_wfs_conf_id PRIMARY KEY (wfs_conf_id),
	CONSTRAINT wfs_conf_ibfk_1 FOREIGN KEY (fkey_wfs_id) REFERENCES public.wfs(wfs_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_conf_ibfk_2 FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_element definition

-- Drop table

-- DROP TABLE public.wfs_element;

CREATE TABLE public.wfs_element (
	fkey_featuretype_id int4 NOT NULL DEFAULT 0,
	element_id serial4 NOT NULL,
	element_name varchar(255) NULL,
	element_type varchar(255) NULL,
	CONSTRAINT pk_wfs_element PRIMARY KEY (fkey_featuretype_id, element_id),
	CONSTRAINT wfs_element_element_id_key UNIQUE (element_id),
	CONSTRAINT wfs_element_ibfk_1 FOREIGN KEY (fkey_featuretype_id) REFERENCES public.wfs_featuretype(featuretype_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.gui_wfs_conf definition

-- Drop table

-- DROP TABLE public.gui_wfs_conf;

CREATE TABLE public.gui_wfs_conf (
	fkey_gui_id varchar(50) NOT NULL DEFAULT ''::character varying,
	fkey_wfs_conf_id int4 NOT NULL DEFAULT 0,
	CONSTRAINT pk_fkey_wfs_conf_id PRIMARY KEY (fkey_gui_id, fkey_wfs_conf_id),
	CONSTRAINT gui_wfs_conf_ibfk_1 FOREIGN KEY (fkey_gui_id) REFERENCES public.gui(gui_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT gui_wfs_conf_ibfk_2 FOREIGN KEY (fkey_wfs_conf_id) REFERENCES public.wfs_conf(wfs_conf_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);


-- public.wfs_conf_element definition

-- Drop table

-- DROP TABLE public.wfs_conf_element;

CREATE TABLE public.wfs_conf_element (
	wfs_conf_element_id serial4 NOT NULL,
	fkey_wfs_conf_id int4 NOT NULL DEFAULT 0,
	f_id int4 NOT NULL DEFAULT 0,
	f_geom int4 NULL DEFAULT 0,
	f_gid int4 NOT NULL DEFAULT 0,
	f_search int4 NULL,
	f_pos int4 NULL,
	f_style_id varchar(255) NULL,
	f_toupper int4 NULL,
	f_label varchar(255) NULL,
	f_label_id varchar(50) NULL,
	f_show int4 NULL,
	f_respos int4 NULL,
	f_form_element_html text NULL,
	f_edit int4 NULL,
	f_mandatory int4 NULL,
	f_auth_varname varchar(255) NULL,
	f_show_detail int4 NULL,
	f_operator varchar(50) NULL,
	f_detailpos int4 NULL DEFAULT 0,
	f_min_input int4 NULL DEFAULT 0,
	f_helptext text NULL,
	f_category_name varchar(255) NOT NULL DEFAULT ''::character varying,
	CONSTRAINT pk_wfs_conf_element_id PRIMARY KEY (wfs_conf_element_id),
	CONSTRAINT wfs_conf_element_ibfk_1 FOREIGN KEY (fkey_wfs_conf_id) REFERENCES public.wfs_conf(wfs_conf_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT wfs_conf_element_id_ibfk_1 FOREIGN KEY (f_id) REFERENCES public.wfs_element(element_id) ON DELETE CASCADE ON UPDATE CASCADE
)
WITH (
	OIDS=TRUE
);
