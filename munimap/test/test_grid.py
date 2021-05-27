from munimap.test.base import BaseTestClass

from nose.tools import eq_

COMMON_PARAMS = {
    'srs': 'EPSG:4326',
    'bbox': '8.5,52.0,8.6,52.1',
    'width': '200',
    'height': '200',
}

class TestIndex(BaseTestClass):

    def test_mising_param(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            del params['bbox']
            r = c.get('/export/grid.geojson', query_string=params)
            assert r.status_code == 400

    def test_invalid_param(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['cellsx'] = 'foo'
            params['cellsy'] = 'foo'
            r = c.get('/export/grid.geojson', query_string=params)
            assert r.status_code == 400, r

    def test_small_default_grid(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            r = c.get('/export/grid.geojson', query_string=params)

            features = r.json['features']
            # default to 4 by 4 cells for this grid
            eq_(sum(1 for f in features if f['geometry']['type'] == 'Point'), 4 + 4 + 4 + 4)
            eq_(sum(1 for f in features if f['geometry']['type'] == 'LineString'), 5 + 5)

    def test_large_default_grid(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['width'] = '2000'
            params['height'] = '2000'
            r = c.get('/export/grid.geojson', query_string=params)

            features = r.json['features']
            # default to 9 by 9 cells for this grid
            eq_(sum(1 for f in features if f['geometry']['type'] == 'Point'), 9 + 9 + 9 + 9)
            eq_(sum(1 for f in features if f['geometry']['type'] == 'LineString'), 10 + 10)

    def test_custom_grid(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['cellsx'] = '6'
            params['cellsy'] = '7'
            r = c.get('/export/grid.geojson', query_string=params)

            features = r.json['features']
            eq_(sum(1 for f in features if f['geometry']['type'] == 'Point'), 6 + 6 + 7 + 7)
            eq_(sum(1 for f in features if f['geometry']['type'] == 'LineString'), 7 + 8)

    def test_labels_only(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['lines'] = 'false'
            r = c.get('/export/grid.geojson', query_string=params)

            features = r.json['features']
            eq_(sum(1 for f in features if f['geometry']['type'] == 'Point'), 4 + 4 + 4 + 4)
            eq_(sum(1 for f in features if f['geometry']['type'] == 'LineString'), 0)

    def test_lines_only(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['labels'] = 'false'
            r = c.get('/export/grid.geojson', query_string=params)

            features = r.json['features']
            eq_(sum(1 for f in features if f['geometry']['type'] == 'Point'), 0)
            eq_(sum(1 for f in features if f['geometry']['type'] == 'LineString'), 5 + 5)

