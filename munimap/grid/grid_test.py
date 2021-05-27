import random

from nose.tools import eq_

from .grid import calculate_num_cells

def test_calculate_num_cells():
    eq_(calculate_num_cells((1000, 1000), (1000, 1000)),
        (2, 2))

    eq_(calculate_num_cells((1000, 1000), (200, 200)),
        (5, 5))

    eq_(calculate_num_cells((2000, 1000), (200, 200)),
        (10, 5))

    eq_(calculate_num_cells((1000, 1000), (100, 100)),
        (10, 10))

    eq_(calculate_num_cells((1000, 1000), (10, 10), max_cells=(20, 20)),
        (20, 20))


def random_points(bbox, srs, num_points, type_names):
    features = []
    for i in range(num_points):
        features.append({
                "type": "Feature",
                "properties": {
                    "num": i + 1,
                    "type": random.choice(type_names),
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [random.uniform(bbox[0], bbox[2]), random.uniform(bbox[1], bbox[3])]
                },
            })

    return {
        "type": "FeatureCollection",
        'crs': {
           'type': 'name',
           'properties': {
               'name': 'EPSG:%d' % srs,
           },
        },
        "features":  features,
    }

