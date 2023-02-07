import json

from flask import url_for

from munimap.helper import _

from munimap_digitize.test.base import BaseTestWithDigitizeDB
from munimap_digitize.model import FeatureGroup

from munimap_digitize.test.base import login_regular_user


class TestDigitizeFeatures(BaseTestWithDigitizeDB):

    def test_add_feature(self):
        """
         add a feature from a geojson to an emtpy group
         check if geometry, style and properties are saved correctly
        """

        # check if group is empty
        group = FeatureGroup.by_name("empty_test_group")
        assert len(group.features) == 0

        with self.app.test_client() as c:
            login_regular_user(c)
            feature_collection = {
                'type': 'FeatureCollection',
                'features': [{
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [449389, 5887352],
                                [446228, 5882044],
                                [452902, 5882502],
                                [449389, 5887352]
                            ]
                        ]
                    },
                    'type': 'Feature',
                    'properties': {
                        'style': {
                            'strokeColor': '#0f0',
                            'strokeWidth': '3'
                        },
                        'foo': '17',
                        'bar': 'Fred'
                    }
                }]
            }

            data = {
                'featureCollection': feature_collection,
                'name': "empty_test_group"
            }

            resp = c.post(
                url_for('digitize.features'),
                data=json.dumps(data),
                content_type='application/json'
            )
            self.assertEqual(resp.status_code, 200)

            resp_data = json.loads(resp.data)
            assert resp_data['action'] == 'created'
            group = FeatureGroup.by_name("empty_test_group")
            assert len(group.features) == 1

            for feature in group.features:
                assert "style" not in feature.properties
                assert feature.properties == {"bar": "Fred",  "foo": "17"}
                assert feature.style == {"strokeColor": "#0f0", "strokeWidth": "3"}
                geojson = json.loads(feature.geojson)
                print(geojson)
                assert geojson == {'type': 'Polygon', 'coordinates': [[[449389, 5887352], [446228, 5882044], [452902, 5882502], [449389, 5887352]]]}

    def test_update_feature(self):
        """
         add a feature from a geojson to an group wiht features
         check if geometry, style and properties are saved correctly
        """

        # check if group is empty
        group = FeatureGroup.by_name("test_group_one")
        assert len(group.features) == 2

        feature_collection = {
            'type': 'FeatureCollection',
            'features': [{
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        [
                            [449389, 5887352],
                            [446228, 5882044],
                            [452902, 5882502],
                            [449389, 5887352]
                        ]
                    ]
                },
                'type': 'Feature',
                'properties': {
                    'style': {
                        'strokeColor': '#0f0',
                        'strokeWidth': '3'
                    },
                    'foo': '17',
                    'bar': 'Fred'
                }
            }]
        }

        with self.app.test_client() as c:
            login_regular_user(c)

            data = {
                'featureCollection': feature_collection,
                'name': "test_group_one"
            }

            resp = c.post(
                url_for('digitize.features'),
                data=json.dumps(data),
                content_type='application/json'
            )

            self.assertEqual(resp.status_code, 200)

            resp_data = json.loads(resp.data)
            assert resp_data['action'] == 'created'

            group = FeatureGroup.by_name("test_group_one")
            assert len(group.features) == 1

            for feature in group.features:
                assert "style" not in feature.properties
                assert feature.properties == {"bar": "Fred",  "foo": "17"}
                assert feature.style == {"strokeColor": "#0f0", "strokeWidth": "3"}
                geojson = json.loads(feature.geojson)
                print(geojson)
                assert geojson == {'type': 'Polygon', 'coordinates': [[[449389, 5887352], [446228, 5882044], [452902, 5882502], [449389, 5887352]]]}
