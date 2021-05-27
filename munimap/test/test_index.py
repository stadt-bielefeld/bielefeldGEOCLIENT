from munimap.test.base import BaseTestWithTestDB

from nose.tools import eq_

COMMON_PARAMS = {
    'srs': 'EPSG:4326',
    'bbox': '8.5,52.0,8.6,52.1',
    'layers': 'osm_bus_stops',
    'width': '200',
    'height': '200',
}

class TestIndex(BaseTestWithTestDB):

    def test_bad_json_request(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            del params['bbox']
            r = c.get('/index.json', query_string=params)
            assert r.status_code == 400

    def test_empty_json_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['bbox'] = '9.5,53.0,9.6,53.1'
            r = c.get('/index.json', query_string=params)

            eq_(r.json, {'topics': [], 'title': 'Index'})

    def test_single_topic_json_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            r = c.get('/index.json', query_string=params)

            eq_(r.json['title'], 'Bus stops')
            eq_(len(r.json['topics']), 1)
            eq_(len(r.json['topics'][0]['groups'][0]['entries']), 2)
            eq_(r.json['topics'][0]['groups'][0]['entries'][0]['ref'], 'B3')
            eq_(r.json['topics'][0]['groups'][0]['entries'][0]['name'], '1 Bielefeld Hauptbahnhof')
            eq_(r.json['topics'][0]['groups'][0]['entries'][1]['ref'], 'B4')
            eq_(r.json['topics'][0]['groups'][0]['entries'][1]['name'], '2 Jahnplatz')

    def test_no_grid_empty_json_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            del params['width']
            del params['height']
            r = c.get('/index.json', query_string=params)
            eq_(r.json, {'topics': [], 'title': 'Index'})

    def test_bad_csv_request(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            del params['bbox']
            r = c.get('/index.csv', query_string=params)
            assert r.status_code == 400

    def test_csv_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            r = c.get('/index.csv', query_string=params)

            eq_(r.data, 'Bielefeld Hauptbahnhof;B3\r\nJahnplatz;B4\r\n')

    def test_empty_csv_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            params['bbox'] = '9.5,53.0,9.6,53.1'
            r = c.get('/index.csv', query_string=params)

            eq_(r.data, '')

    def test_no_grid_empty_csv_index(self):
        with self.app.test_client() as c:
            params = dict(COMMON_PARAMS)
            del params['width']
            del params['height']
            r = c.get('/index.csv', query_string=params)
            eq_(r.data, '')
