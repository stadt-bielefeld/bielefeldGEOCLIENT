from munimap.query import pq
from shapely.geometry import asShape
from munimap.grid import RefFinder
from munimap.grid.refs import format_refs, reduce_refs, group_refs
from munimap.query.features import sort_features


def query_feature_collection(request, pg_layers, num_offset=1):
    fc = pq.query(request, pg_layers)

    grid = request.grid
    if grid:
        ref_grid = RefFinder(grid.boxes())
        for feature in fc['features']:
            refs = ref_grid.refs(asShape(feature['geometry']))
            if refs:
                groups = group_refs(refs)
                refs = ', '.join(format_refs(reduce_refs(g), labels=grid.labels) for g in groups)
                feature['properties'][
                    '__ref__'] =  refs
            else:
                feature['properties']['__ref__'] = ''

    sort_features(
        fc['features'],
        sort_properties=('name',),
        group_property='__layer__',
        groups=list(pg_layers.keys()),
    )

    # add __num__ for all point layers
    # TODO Mapfish-Digitize not used for numbers actually
    point_layers = set()
    for l in request.layers:
        if pg_layers[l]['type'] == 'digitize':
            continue
        if l in pg_layers and pg_layers[l]['source']['type'] == 'point':
            point_layers.add(l)

    i = num_offset
    for feature in fc['features']:
        if feature['properties']['__layer__'] in point_layers:
            feature['properties']['__num__'] = i
            i += 1

    if request.srs != 4326:
        fc['crs'] = {
            'type': 'name',
            'properties': {
              'name': 'urn:ogc:def:crs:EPSG::%d' % request.srs,
            },
        }
    return fc
