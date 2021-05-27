import json
from werkzeug.test import EnvironBuilder
from werkzeug.wrappers import Request
from werkzeug.exceptions import BadRequest
from ..requests import MapRequest, PrintRequest

class TestMapRequest(object):

    def test_bad_requests(self):
        yield self.check_bad_request, ''
        yield self.check_bad_request, 'bbox=12'
        yield self.check_bad_request, 'bbox=12,12,13,doo'
        yield self.check_good_request, 'bbox=12,12,13,13'

        yield self.check_bad_request, 'bbox=12,12,13,13&width=12a'
        yield self.check_bad_request, 'bbox=12,12,13,13&width=12'
        yield self.check_good_request, 'bbox=12,12,13,13&width=12&height=12'

    def check_bad_request(self, query):
        env = EnvironBuilder().get_environ()
        env['QUERY_STRING'] = query
        r = Request(env)
        try:
            MapRequest.from_req(r)
        except BadRequest:
            pass
        else:
            assert False, 'expected BadRequest for ' + query

    def check_good_request(self, query):
        env = EnvironBuilder().get_environ()
        env['QUERY_STRING'] = query
        r = Request(env)
        MapRequest.from_req(r)

class TestPrintRequest(object):

    def test_bad_requests(self):
        req = {
            'bbox': [12, 12, 13, 13],
            'srs': 4326,
            'layers': ['foo'],
            'output_format': 'png',
            'page_layout': 'a5_landscape',
            'scale': 500,
            'mimetype': 'application/pdf',
            'page_size': [297, 210],
            'name': 'example.pdf',
            'feature_collection': {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            477596.46765,
                            5774028.03576
                        ]
                    }
                }]
            }
        }
        yield self.check_good_request, req

        r = dict(req)
        r.pop('feature_collection')
        yield self.check_good_request, r

        r = dict(req)
        r.pop('bbox')
        yield self.check_bad_request, r

        r = dict(req)
        r['srs'] = 'EPSG:4326'
        yield self.check_bad_request, r

        r = dict(req)
        r['bbox'] = 'foo'
        yield self.check_bad_request, r

        r = dict(req)
        r.pop('page_layout')
        yield self.check_bad_request, r

        r = dict(req)
        r.pop('output_format')
        yield self.check_bad_request, r

        r = dict(req)
        r.pop('scale')
        yield self.check_bad_request, r

        r = dict(req)
        r.pop('mimetype')
        yield self.check_bad_request, r

        r = dict(req)
        r.pop('name')
        yield self.check_bad_request, r

    def check_bad_request(self, params):
        try:
            PrintRequest.from_json(params)
        except BadRequest:
            pass
        else:
            assert False, 'expected BadRequest for ' + str(params)

    def check_good_request(self, params):
        PrintRequest.from_json(params)
