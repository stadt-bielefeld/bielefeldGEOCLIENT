DROP SCHEMA IF EXISTS munimaptest CASCADE;
CREATE SCHEMA munimaptest;

SET search_path = munimaptest, public, pg_catalog;

CREATE TABLE osm_transport_points (
    id integer PRIMARY KEY NOT NULL,
    osm_id bigint,
    name character varying,
    type character varying,
    ref character varying,
    geometry geometry(Point, 4326)
);

CREATE TABLE osm_landusages (
    id integer PRIMARY KEY NOT NULL,
    osm_id bigint,
    name character varying,
    type character varying,
    geometry geometry(Polygon, 4326)
);


ALTER TABLE osm_transport_points OWNER TO osm;
ALTER TABLE osm_landusages OWNER TO osm;

INSERT INTO osm_transport_points VALUES (1, 100001, 'Bielefeld Hauptbahnhof', 'bus_stop', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.535 52.028)'));
INSERT INTO osm_transport_points VALUES (2, 100002, 'Jahnplatz', 'bus_stop', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.533 52.023)'));
INSERT INTO osm_transport_points VALUES (3, 100003, 'Pferdemarkt', 'bus_stop', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.214 53.146)'));
INSERT INTO osm_transport_points VALUES (4, 100004, 'Oldenburg Hauptbahnhof Süd', 'bus_stop', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.222 53.143)'));

INSERT INTO osm_transport_points VALUES (5, 100005, 'Hauptbahnhof', 'station', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.22 53.15)'));
INSERT INTO osm_transport_points VALUES (6, 100006, 'Nebenbahnhof', 'station', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.23 53.146)'));
INSERT INTO osm_transport_points VALUES (7, 100007, 'Bahnhof Pferdemark', 'station', '123', ST_GeomFromEWKT('SRID=4326;POINT(8.2141 53.1461)'));

INSERT INTO osm_landusages VALUES(1, 100005, 'A', 'garden', ST_GeomFromEWKT('SRID=4326;POLYGON((8.2323 53.1448, 8.2315 53.1437, 8.2285 53.1447, 8.2284 53.1450, 8.2295 53.1453, 8.2309 53.1450, 8.2319 53.1450, 8.2323 53.1448))'));
INSERT INTO osm_landusages VALUES(2, 100006, 'B', 'garden', ST_GeomFromEWKT('SRID=4326;POLYGON((8.2148 53.1482, 8.2129 53.1509, 8.2155 53.1511, 8.2154 53.1507, 8.2165 53.1505, 8.2148 53.1482))'));

CREATE INDEX osm_transport_points_geom ON osm_transport_points USING gist (geometry);
CREATE INDEX osm_landusages_geom ON osm_landusages USING gist (geometry);
