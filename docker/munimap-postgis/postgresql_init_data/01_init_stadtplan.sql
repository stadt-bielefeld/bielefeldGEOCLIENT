CREATE DATABASE stadtplan;

\connect stadtplan

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE SCHEMA osm;
