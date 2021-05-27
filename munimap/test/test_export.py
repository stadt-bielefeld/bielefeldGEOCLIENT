import json
import re

from copy import deepcopy

from munimap.test.base import BaseTestWithPrintqueueDB

from nose.tools import eq_


class TestExportPrintCheck(BaseTestWithPrintqueueDB):

    def test_status_inprocess(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/1/status')

            assert 'status' in r.json
            assert r.json['status'] == 'inprocess'
            assert 'statusURL' in r.json
            self.assert200(r)

    def test_status_finished(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/2/status')

            assert 'status' in r.json
            assert r.json['status'] == 'finished'
            assert 'downloadURL' in r.json
            self.assert200(r)

    def test_status_error(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/3/status')

            assert 'status' in r.json
            assert r.json['status'] == 'error'
            self.assert500(r)

    def test_job_not_exists(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/4/status')
            self.assert404(r)


class TestExportPrintDownload(BaseTestWithPrintqueueDB):

    def test_download_not_exists(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/4/download')
            self.assert404(r)

    def test_unfinished_download(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/1/download')
            self.assert404(r)

    def test_error_download(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/3/download')
            self.assert500(r)

    def test_download(self):
        with self.app.test_client() as c:
            r = c.get('/export/map/2/download')
            self.assert200(r)
            eq_(r.data, 'dummy_print_download_response')


COMMON_PARAMS = {
    'bbox': [12, 12, 13, 13],
    'srs': 4326,
    'layers': ['omniscale'],
    'output_format': 'png',
    'page_layout': 'a5_landscape',
    'scale': 500,
    'mimetype': 'application/pdf',
    'page_size': [297, 210],
    'name': 'example.pdf'
}


class TestExportPrintPost(BaseTestWithPrintqueueDB):

    def test_invalid_json(self):
        with self.app.test_client() as c:
            r = c.post('/export/map')
            self.assert400(r)

    def test_invalid_layers(self):
        with self.app.test_client() as c:
            params = deepcopy(COMMON_PARAMS)
            params['layers'] = ['foo']
            r = c.post(
                '/export/map',
                content_type='application/json',
                data=json.dumps(params),
            )
            self.assert400(r)

    def test_print_queue_job_created(self):
        self.app.config['PRINT_USE_BROKER'] = True

        with self.app.test_client() as c:
            r = c.post(
                '/export/map',
                content_type='application/json',
                data=json.dumps(COMMON_PARAMS),
            )
            assert '201' in r.status
            assert 'status' in r.json
            assert r.json['status'] == 'added'
            assert 'statusURL' in r.json

            parse_id = r'http://localhost/export/map/([0-9a-f]*)/status'
            parsed = re.match(parse_id, r.json['statusURL'])
            assert parsed is not None
            assert len(parsed.groups()) == 1
            id = parsed.groups()[0]

            entry = self.print_db.get(id)
            assert entry is not None
            assert entry.status == 'added'


    # printed document tests located in test_mapfish_print.py
