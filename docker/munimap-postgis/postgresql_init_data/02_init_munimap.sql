CREATE DATABASE munimap;

\connect munimap;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;


-- public.alembic_version definition

-- Drop table

-- DROP TABLE public.alembic_version;

CREATE TABLE public.alembic_version (
	version_num varchar(32) NOT NULL
);

INSERT INTO public.alembic_version VALUES ('4dc7cd47165d');


-- public.digitize_layers definition

-- Drop table

-- DROP TABLE public.digitize_layers;

CREATE TABLE public.digitize_layers (
	id serial4 NOT NULL,
	name varchar NULL,
	title varchar NULL,
	"_properties_schema" varchar NULL,
	"_style" varchar NULL,
	CONSTRAINT digitize_layers_name_key UNIQUE (name),
	CONSTRAINT digitize_layers_pkey PRIMARY KEY (id)
);


-- public.digitize_feature_groups definition

-- Drop table

-- DROP TABLE public.digitize_feature_groups;

CREATE TABLE public.digitize_feature_groups (
	id serial4 NOT NULL,
	layer_id int4 NULL,
	name varchar NULL,
	title varchar NULL,
	min_res float8 NULL,
	max_res float8 NULL,
	"_active" bool NULL,
	end_date timestamp NULL,
	start_date timestamp NULL,
	CONSTRAINT digitize_feature_groups_name_key UNIQUE (name),
	CONSTRAINT digitize_feature_groups_pkey PRIMARY KEY (id),
	CONSTRAINT digitize_feature_groups_layer_id_fkey FOREIGN KEY (layer_id) REFERENCES public.digitize_layers(id)
);


-- public.digitize_features definition

-- Drop table

-- DROP TABLE public.digitize_features;

CREATE TABLE public.digitize_features (
	id serial4 NOT NULL,
	feature_group_id int4 NULL,
	geometry geometry(geometry, 25832) NULL,
	"style" hstore NULL,
	properties hstore NULL,
	CONSTRAINT digitize_features_pkey PRIMARY KEY (id),
	CONSTRAINT digitize_features_feature_group_id_fkey FOREIGN KEY (feature_group_id) REFERENCES public.digitize_feature_groups(id)
);
CREATE INDEX idx_digitize_features_geometry ON public.digitize_features USING gist (geometry);
