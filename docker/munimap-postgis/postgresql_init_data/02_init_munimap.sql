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

-- public.digitize_features definition

-- Drop table

-- DROP TABLE public.digitize_features;

CREATE TABLE public.digitize_features (
	id serial4 NOT NULL,
	geometry public.geometry(geometry, 25832) NULL,
	properties jsonb NULL,
	layer_name varchar NULL,
	created timestamp NULL,
	modified timestamp NULL,
	created_by int4 NULL,
	modified_by int4 NULL,
	CONSTRAINT digitize_features_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_digitize_features_geometry ON public.digitize_features USING gist (geometry);
CREATE INDEX ix_digitize_features_layer_name ON public.digitize_features USING btree (layer_name);
