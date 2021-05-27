from .feature_group import FeatureGroup
from .layer import Layer
from .feature import Feature


def all():
    group1 = FeatureGroup(
        title='Test Group 1',
        active=True
    )

    group2 = FeatureGroup(
        title='Test Group 2',
        active=False
    )

    layer = Layer(
        name='test_layer',
        title='Test Layer',
        feature_groups=[group1, group2],
        _properties_schema='''{
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "title": "Name"
        },
        "description": {
            "type": "string",
            "title": "Description",
            "x-schema-form":  {
                "type": "textarea"
            }
        }
    }
}'''
    )

    feature_collection = {
        'type': 'FeatureCollection',
        'features': [
            {'geometry':
                {
                    'type': 'Polygon',
                    'coordinates': [[[467890.15939063585, 5761011.048711065], [467584.41127749515, 5760342.22471357], [468845.62224420055, 5760246.678428214], [468578.0926452024, 5760762.628369139], [467890.15939063585, 5761011.048711065]]]
                },
                'type': 'Feature'
            },
            {'geometry':
                {
                    'type': 'LineString',
                    'coordinates': [[468023.9241901349, 5762558.898533841], [468578.0926452024, 5762100.276364129], [469762.8665836227, 5761622.544937347]]
                },
                'type': 'Feature',
                'properties': None
            }
        ]
    }

    features = feature_collection.get('features', [])
    for feature in features:
        feature = Feature(feature_group=group1, geojson=feature)

    return [layer]
