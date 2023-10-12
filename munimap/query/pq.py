from collections import OrderedDict
import sqlalchemy as sa

from shapely.wkb import loads
from shapely.geometry import mapping

from munimap.model import Feature

class LayerNotFoundError(Exception):
    pass


def load_layers(config, default_db_uri, db_schema, db_echo=False):
    queryable_layers = OrderedDict()
    engines = {}
    for layer in config['layers'].values():
        if layer['type'] not in ('postgis', 'digitize'):
            continue

        if layer['type'] == 'postgis':
            uri = layer['source'].get('db_uri', default_db_uri)
            if uri in engines:
                engine = engines[uri]
            else:
                def init_search_path(connection, conn_record):
                    cursor = connection.cursor()
                    try:
                        cursor.execute('SET search_path TO %s, public' % db_schema)
                    finally:
                        cursor.close()

                engine = sa.create_engine(uri, echo=db_echo)
                if db_schema != 'public':
                    sa.event.listen(engine, 'connect', init_search_path)

                engines[uri] = engine

            layer['source']['db_engine'] = engine
        queryable_layers[layer['name']] = layer

    return queryable_layers


def query(q, queryable_layers):
    features = []

    for layer in q.layers:
        if layer not in queryable_layers:
            raise LayerNotFoundError(
                'Layer %s not in queryable layers list' % layer)

        layer_type = queryable_layers[layer]['type']
        if layer_type == 'digitize':
            layer_name = queryable_layers[layer]['source']['name']
            digitize_features = Feature.by_name(layer_name)
            features = features + Feature.mapfish_features(digitize_features, layer)

        if layer_type == 'postgis':
            sql = queryable_layers[layer]['source']['query']

            if '!bbox!' in sql:
                sql = sql.replace(
                    '!bbox!', 'ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, :bbox_srs), :db_srs)')
                where = ''
            else:
                where = 'WHERE geometry && ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, :bbox_srs), :db_srs)'

            sql = 'SELECT *, ST_Transform(geometry, :bbox_srs) AS __transformed_geom__ FROM (%s) AS data %s limit :limit;' % (
                sql,
                where
            )
            rows = queryable_layers[layer]['source']['db_engine'].execute(sa.text(sql), {
                'minx': q.bbox[0],
                'miny': q.bbox[1],
                'maxx': q.bbox[2],
                'maxy': q.bbox[3],
                'bbox_srs': q.srs,
                'db_srs': queryable_layers[layer]['source'].get('srid', 3857),
                'limit': q.limit,
            }).fetchall()

            for row in rows:
                features.append(row_to_feature(row, layername=layer))

    return {
        'type': 'FeatureCollection',
        'features': features
    }


def row_to_feature(row, layername=None):
    feature = {
        'type': 'Feature',
        'properties': {
            # identifies mapfish vector style
            'mapfishStyleId': '1'
        },
        'geometry': {}
    }
    for k, v in row.items():
        if k == 'geometry':
            continue
        elif k == '__transformed_geom__':
            feature['geometry'] = mapping(loads(v, hex=True))
        else:
            feature['properties'][k] = v
    if layername:
        feature['properties']['__layer__'] = layername
    return feature
