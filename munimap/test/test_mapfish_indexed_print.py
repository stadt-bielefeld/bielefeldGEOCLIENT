import os
import subprocess
from nose.plugins.attrib import attr

from munimap.test.test_mapfish_print import BaseMapfishPrintTest

tmp_dir = '/tmp/munimap-mapfish-prints'


def setUp():
    try:
        os.makedirs(tmp_dir)
        print(os.path.exists(tmp_dir))
    except:
        pass


def tearDown():
    if any(f for f in os.listdir(tmp_dir) if not f.startswith('.')):
        subprocess.check_call(['open', tmp_dir])


class TestMapfishIndexedPrint(BaseMapfishPrintTest):

    test_layers = ['busstop', 'station']
    # test_bbox = [8.2, 53.142, 8.24, 53.152]
    # test_srs = 4326
    test_bbox = [446488.500917842, 5888365.96595956, 449175.838684616, 5889449.2386312]
    test_srs = 25832

    def prepare_index_query(self):
        params = {}
        for key, value in self.prepare_data().items():
            if key == 'pageSize':
                params['width'] = value[0]
                params['height'] = value[1]
                continue
            if isinstance(value, list):
                params[key] = ','.join(map(str, value))
                continue
            if key == 'srs':
                params[key] = 'EPSG:%s' % value
                continue
            params[key] = value
        return params

    @attr('print')
    def test_response(self):
        with self.app.test_client() as c:
            r = c.get('/index.pdf', query_string=self.prepare_index_query())

            self.assert200(r)

            if isinstance(self.test_layers[0], str):
                layernames = '_'.join(self.test_layers)
            else:
                layernames = '_'.join([n for n, p in self.test_layers])

            filename = 'munimap_%s_%s_%s_%s_index.pdf' % (
                self.test_page_layout,
                layernames,
                self.test_dpi,
                self.test_scale
            )
            with open(os.path.join(tmp_dir, filename), 'wb') as target:
                target.write(r.get_data())
        super(TestMapfishIndexedPrint, self).test_response()
