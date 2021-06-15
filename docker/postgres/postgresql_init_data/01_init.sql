CREATE USER osm WITH PASSWORD 'osm';
CREATE USER mapbender WITH PASSWORD 'mapbender';

CREATE DATABASE osm OWNER osm;

\connect osm;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;
ALTER TABLE geometry_columns OWNER TO osm;
ALTER TABLE spatial_ref_sys OWNER TO osm;

CREATE DATABASE munimap OWNER osm;

\connect munimap;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;
ALTER TABLE geometry_columns OWNER TO osm;
ALTER TABLE spatial_ref_sys OWNER TO osm;

CREATE DATABASE mapbender OWNER mapbender;

\connect mapbender;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;
ALTER TABLE geometry_columns OWNER TO mapbender;
ALTER TABLE spatial_ref_sys OWNER TO mapbender;
