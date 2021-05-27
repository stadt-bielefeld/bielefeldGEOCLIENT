import re
import json

import sqlalchemy as sa
from flask import current_app
from natsort import natsorted

from munimap.helper import _

def create_engine():
    uri = current_app.config.get('SQLALCHEMY_LAYER_DATABASE_URI')
    return sa.create_engine(uri,
                            echo=current_app.config.get('SQLALCHEMY_ECHO'))


QUERY_STATIONS_WITH_HULL = """
    SELECT *,
        ST_Asgeojson(geometry, 0) as geometry
    FROM osm_stations
    WHERE
        geometry && ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, 4326), 3857)
        AND EXISTS -- only if at least one stop at the sation matches our ref
        (SELECT 1 FROM (SELECT unnest(refs) AS ref) AS x
            WHERE x.ref ~:ref_expression);
;
"""

QUERY_STATIONS = """
    SELECT *,
        ST_Asgeojson(ST_Envelope(geometry), 0) as geometry
    FROM osm_stations
    WHERE
        geometry && ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, 4326), 3857)
        AND EXISTS -- only if at least one stop at the sation matches our ref
        (SELECT 1 FROM (SELECT unnest(refs) AS ref) AS x
            WHERE x.ref ~:ref_expression);
;
"""

QUERY_SEGMENTS = """
    SELECT
        refs, type,
        ST_AsGeoJSON(ST_Union(geometry)) AS geometry
    FROM (
        SELECT
            m.member, m.geometry, type, m.osm_id,
            array_agg(m.ref) OVER w AS refs
        FROM (
            SELECT m.member, m.ref, m.geometry, r.tags->'route' AS type, r.osm_id
            FROM osm.osm_route_members m
                LEFT OUTER JOIN osm.osm_routes r ON m.osm_id = r.osm_id
            WHERE r.osm_id = :osm_id
               AND m.role IN ('', 'forwards', 'backwards')
            GROUP BY r.osm_id, m.member, m.ref, m.geometry, r.tags->'route'
        ) AS m
        WINDOW w AS (PARTITION BY m.member)
    ) AS segments
    GROUP BY refs, type
"""


def query_stations(layer=None, operator=None, bbox=[-180, -90, 180, 90], with_hull=False):
    engine = create_engine()

    # switch between day and night stations
    # load only the refs where a public conveyance stopped
    ref_expression = '^[^N]'
    if 'night' in layer:
        ref_expression = '^[N]'

    if with_hull:
        sql_query = QUERY_STATIONS_WITH_HULL
    else:
        sql_query = QUERY_STATIONS

    rows = engine.execute(sa.text(sql_query), {
        'ref_expression': ref_expression,
        'minx': bbox[0],
        'miny': bbox[1],
        'maxx': bbox[2],
        'maxy': bbox[3],
    }).fetchall()
    features = []
    for row in rows:
        features.append(stations_to_feature(row, operator=operator, ref_expression=ref_expression))

    return {
        'type': 'FeatureCollection',
        'features': features
    }


def stations_to_feature(row, operator=None, ref_expression=None):
    feature = {
        'type': 'Feature',
        'properties': {
            'routes': []
        },
        'geometry': {}
    }

    feature['geometry'] = json.loads(row['geometry'])
    feature['properties']['name'] = row['name']
    feature['properties']['city'] = row['city']

    zipped_properties = zip(
        row['refs'],
        row['ids'],
        row['names'],
        row['froms'],
        row['vias'],
        row['tos'],
        row['types'],
        row['operator'],
    )
    properties = map(
        dict,
        map(lambda p: zip(('ref', 'id', 'name', 'from', 'via', 'to', 'type', 'operator'), p), zipped_properties)
    )

    routes = {}
    osm_ids = set()
    for subr in properties:
        ref = subr['ref']

        # filter out unwanted refs. row does contain at least one
        # matching ref (by EXISTS query).
        if ref_expression and not re.match(ref_expression, ref):
            continue

        if ref not in routes:
            routes[ref] = {
                'ref': ref,
                'type': subr['type'],
                'operator': subr['operator'],
                'subroutes': []
            }

        if subr['via']:
            description = _(
                'From %(_from)s via %(via)s to %(to)s',
                _from=subr['from'],
                via=subr['via'],
                to=subr['to']
            )
        else:
            description = _(
                'From %(_from)s to %(to)s',
                _from=subr['from'],
                to=subr['to']
            )

        if not subr['from'] or not subr['to']:
            description = subr['name']

        if subr['id'] not in osm_ids:
            subroute = {
                'id': subr['id'],
                'description': description
            }
            routes[ref]['subroutes'].append(subroute)
            osm_ids.add(subr['id'])

            sorted_sub_routes = natsorted(
                routes[ref]['subroutes'], key=lambda k: k['description'])
            routes[ref]['subroutes'] = sorted_sub_routes

    sorted_routes = natsorted(routes.values(), key=lambda k: k['ref'])
    feature['properties']['routes'] = sorted_routes

    return feature


def query_route(osm_id):
    engine = create_engine()

    rows = engine.execute(sa.text(QUERY_SEGMENTS), {
        'osm_id': osm_id,
    }).fetchall()
    features = []
    for row in rows:
        feature = row_to_feature(row)
        features.append(feature)

    return {
        'type': 'FeatureCollection',
        'features': features
    }


def row_to_feature(row):
    feature = {
        'type': 'Feature',
        'properties': {
        },
        'geometry': {}
    }
    for k, v in row.items():
        if k == 'geometry':
            feature['geometry'] = json.loads(v)
        else:
            feature['properties'][k] = v
    return feature
    