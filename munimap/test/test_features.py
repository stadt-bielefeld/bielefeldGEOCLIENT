from munimap.test.base import BaseTestWithTestDB

from nose.tools import eq_

COMMON_PARAMS = {
    'srs': 'EPSG:4326',
    'bbox': '8.5,52.0,8.6,52.1',
    'layers': 'osm_bus_stops',
}


class TestFeatures(BaseTestWithTestDB):

    def test_invalid_layer(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['layers'] = 'foobar'
            r = c.get('/geojson', query_string=params)
            self.assert400(r)

    def test_empty_feature_collection(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['bbox'] = '9.5,53.0,9.6,53.1'
            r = c.get('/geojson', query_string=params)
            assert len(r.json['features']) == 0, r.json

    def test_point_features(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            r = c.get('/geojson', query_string=params)
            assert len(r.json['features']) == 2, r.json
            f = r.json['features'][0]
            eq_(f['properties']['name'], 'Bielefeld Hauptbahnhof')
            eq_(f['properties']['__layer__'], 'osm_bus_stops')
            eq_(f['geometry']['coordinates'], [8.535, 52.028])
            assert '__ref__' not in f['properties']
            f = r.json['features'][1]
            eq_(f['properties']['name'], 'Jahnplatz')
            assert '__ref__' not in f['properties']

    def test_point_features_crs(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['bbox'] = "465674.8325446885,5761113.747036394,472601.0662576688,5772278.512375365"
            params['srs'] = 'EPSG:25832'
            r = c.get('/geojson', query_string=params)
            assert len(r.json['features']) == 2, r.json
            eq_(r.json['crs'], {'type': 'name', 'properties': {'name': 'urn:ogc:def:crs:EPSG::25832'}})
            f = r.json['features'][0]
            eq_(f['properties']['name'], 'Bielefeld Hauptbahnhof')
            eq_(f['properties']['__layer__'], 'osm_bus_stops')
            eq_(f['geometry']['coordinates'], [468097.5017729189, 5764254.512921952])

    def test_point_features_with_ref(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['width'] = 200
            params['height'] = 200
            r = c.get('/geojson', query_string=params)
            assert len(r.json['features']) == 2, r.json
            f = r.json['features'][0]
            eq_(f['properties']['name'], 'Bielefeld Hauptbahnhof')
            eq_(f['properties']['__ref__'], 'B3')
            f = r.json['features'][1]
            eq_(f['properties']['name'], 'Jahnplatz')
            eq_(f['properties']['__ref__'], 'B4')
