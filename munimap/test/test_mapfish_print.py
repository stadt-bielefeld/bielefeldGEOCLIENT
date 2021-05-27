import os
import json
import subprocess

from nose.plugins.attrib import attr

from munimap.test.base import BaseTestWithTestDB

tmp_dir = '/tmp/munimap-mapfish-prints'


def setUp():
    try:
        os.makedirs(tmp_dir)
        print os.path.exists(tmp_dir)
    except:
        pass


def tearDown():
    if any(f for f in os.listdir(tmp_dir) if not f.startswith('.')):
        subprocess.check_call(['open', tmp_dir])


class BaseMapfishPrintTest(BaseTestWithTestDB):
    test_bbox = [912139, 7007303.5, 917389, 7014728.5]
    test_srs = 3857
    test_page_layout = 'a4_portrait'
    test_page_size = [210, 297]
    test_output_format = 'pdf'
    test_layers = ['omniscale']
    test_scale = 2500
    test_dpi = 300
    test_mimetype = "application/pdf"
    test_name = 'example.pdf'
    test_feature_collection = None

    def setUp(self):
        BaseTestWithTestDB.setUp(self)
        self.app.config['PRINT_USE_BROKER'] = False

    def prepare_data(self):
        return dict(
                bbox=self.test_bbox,
                scale=self.test_scale,
                layers=self.test_layers,
                outputFormat=self.test_output_format,
                dpi=self.test_dpi,
                srs=self.test_srs,
                pageLayout=self.test_page_layout,
                pageSize=self.test_page_size,
                mimetype=self.test_mimetype,
                name=self.test_name,
                feature_collection=self.test_feature_collection
            )

    @attr('print')
    def test_response(self):
        with self.app.test_client() as c:
            data = self.prepare_data()
            resp = c.post('/export/map',
                          content_type='application/json',
                          data=json.dumps(data))

            assert resp.status_code == 201
            assert resp.json['status'] == 'added'

            check_url = resp.json['statusURL'].replace('http://localhost', '')
            resp = c.get(check_url)

            assert resp.json['status'] == 'finished'

            download_url = resp.json['downloadURL'].replace('http://localhost', '')
            resp = c.get(download_url)

            if isinstance(self.test_layers[0], basestring):
                layernames = '_'.join(self.test_layers)
            else:
                layernames = '_'.join([n for n, p in self.test_layers])
            filename = 'munimap_%s_%s_%s_%s%s.%s' % (
                self.test_page_layout,
                layernames,
                self.test_dpi,
                self.test_scale,
                '' if self.test_feature_collection is None else '_feature_collection',
                self.test_output_format,
            )
            with open(os.path.join(tmp_dir, filename), 'wb') as target:
                target.write(resp.get_data())


@attr('print', 'print-full')
class TestMapfishPrintPortraitPdf(BaseMapfishPrintTest):
    pass


@attr('print', 'print-full')
class TestMapfishPrintLandscapePdf(BaseMapfishPrintTest):
    test_page_layout = 'a4_landscape'
    test_page_size = [297, 210]


@attr('print', 'print-full')
class TestMapfishPrintPortraitPng(BaseMapfishPrintTest):
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrintLandscapePng(TestMapfishPrintLandscapePdf):
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrintWMTSBackgroundLayer(BaseMapfishPrintTest):
    test_layers = ['omniscale_wmts']
    test_bbox = [446065.892955075, 5887169.24536738, 449268.406615242, 5891584.47360512]
    test_srs = 25832


@attr('print', 'print-full')
class TestMapfishPrintBaselayerPlusRasterOverlay(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'omniscale_roads']


@attr('print', 'print-full')
class TestMapfishPrintVectorOverlays(BaseMapfishPrintTest):
    test_layers = ['garden', 'busstop']


# @attr('print', 'print-full')
# class TestMapfishPrintWMSOpacity(BaseMapfishPrintTest):
#     test_layers = [['omniscale', {'opacity': 0.5}]]


# @attr('print', 'print-full')
# class TestMapfishPrintVectorOpacity(BaseMapfishPrintTest):
#     test_layers = [
#         ['omniscale', {}],
#         ['garden', {'opacity': 0.25}],
#         ['busstop', {'opacity': 0.75}],
#     ]


@attr('print', 'print-full')
class TestMapfishPrint300DpiPdf(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']


@attr('print', 'print-full')
class TestMapfishPrint200DpiPdf(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_dpi = 200


@attr('print', 'print-full')
class TestMapfishPrint100DpiPdf(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_dpi = 100


@attr('print', 'print-full')
class TestMapfishPrint300DpiPng(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint200DpiPng(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_dpi = 200
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint100DpiPng(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_dpi = 100
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint300DpiScale5000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 5000


@attr('print', 'print-full')
class TestMapfishPrint200DpiScale5000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 5000
    test_dpi = 200


@attr('print', 'print-full')
class TestMapfishPrint100DpiScale5000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 5000
    test_dpi = 100


@attr('print', 'print-full')
class TestMapfishPrint300DpiScale10000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_output_format = 'png'
    test_scale = 10000


@attr('print', 'print-full')
class TestMapfishPrint200DpiScale10000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 10000
    test_dpi = 200


@attr('print', 'print-full')
class TestMapfishPrint100DpiScale10000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_scale = 10000
    test_dpi = 100
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint300DpiScale3000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_output_format = 'png'
    test_scale = 3000


@attr('print', 'print-full')
class TestMapfishPrint200DpiScale3000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 3000
    test_dpi = 200


@attr('print', 'print-full')
class TestMapfishPrint100DpiScale3000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 3000
    test_dpi = 100


@attr('print', 'print-full')
class TestMapfishPrint300DpiScale6000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_scale = 6000
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint200DpiScale6000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_scale = 6000
    test_dpi = 200
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint100DpiScale6000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_scale = 6000
    test_dpi = 100
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint300DpiScale12000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_scale = 12000
    test_mimetype = "image/png"
    test_name = 'example.png'


@attr('print', 'print-full')
class TestMapfishPrint200DpiScale12000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 12000
    test_dpi = 200


@attr('print', 'print-full')
class TestMapfishPrint100DpiScale12000(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray', 'garden', 'busstop']
    test_output_format = 'png'
    test_mimetype = "image/png"
    test_name = 'example.png'
    test_scale = 12000
    test_dpi = 100


@attr('print', 'print-full')
class TestMapfishPrintFeatureCollection(BaseMapfishPrintTest):
    test_layers = ['omniscale_gray']
    test_feature_collection = {
        'features': [{
            'geometry': {
                'coordinates': [
                    914000,
                    7010000
                ],
                'type': 'Point'
            },
            'properties': {
                'style': {
                    'fillColor': '#006600',
                    'fillOpacity': 0.4,
                    'fontColor': '#333',
                    'fontRotation': 0,
                    'fontSize': '10px',
                    'fontWeight': 'normal',
                    'graphicRotation': 0,
                    'radius': 15,
                    'strokeColor': '#002680',
                    'strokeDashstyle': 'dot',
                    'strokeOpacity': 1,
                    'strokeWidth': 4
                }
            },
            'type': 'Feature'
        }, {
            'geometry': {
                'coordinates': [[
                    915000,
                    7011000
                ], [
                    915000,
                    7011500
                ], [
                    915500,
                    7011500
                ]],
                'type': 'LineString'
            },
            'properties': {
                'style': {
                    'fillColor': '#fff',
                    'fillOpacity': 0.4,
                    'fontColor': '#333',
                    'fontRotation': 0,
                    'fontSize': '10px',
                    'fontWeight': 'normal',
                    'graphicRotation': 0,
                    'radius': 5,
                    'strokeColor': '#ff0000',
                    'strokeDashstyle': 'solid',
                    'strokeOpacity': 1,
                    'strokeWidth': 3
                }
            },
            'type': 'Feature'
        }, {
            'geometry': {
                'coordinates': [[
                    [
                        913000,
                        7008000
                    ], [
                        913000,
                        7009000
                    ], [
                        914000,
                        7009000
                    ], [
                        914000,
                        7008000
                    ], [
                        913000,
                        7008000
                    ]
                ]],
                'type': 'Polygon'
            },
            'properties': {
                'style': {
                    'fillColor': '#ffff00',
                    'fillOpacity': 0.4,
                    'fontColor': '#333',
                    'fontRotation': 0,
                    'fontSize': '10px',
                    'fontWeight': 'normal',
                    'graphicRotation': 0,
                    'radius': 5,
                    'strokeColor': '#00ff00',
                    'strokeDashstyle': 'solid',
                    'strokeOpacity': 1,
                    'strokeWidth': 2
                }
            },
            'type': 'Feature'
        }, {
            'geometry': {
                'coordinates': [
                    915000,
                    7009000
                ],
                'type': 'Point'
            },
            'properties': {
                'style': {
                    'fillColor': '#fff',
                    'fillOpacity': 0.4,
                    'fontColor': '#333',
                    'fontRotation': 38,
                    'fontSize': '14px',
                    'fontWeight': 'bold',
                    'graphicRotation': 0,
                    'radius': 0,
                    'strokeColor': '#3399cc',
                    'strokeDashstyle': 'solid',
                    'strokeOpacity': 1,
                    'strokeWidth': 2,
                    'text': 'TestString'
                }
            },
            'type': 'Feature'
        }],
        'properties': {},
        'type': 'FeatureCollection'
    }


# TODO check of we need string bbox
# @attr('print', 'print-full')
# class TestMapfishPrintStringBBOXRequest(BaseMapfishPrintTest):
#     test_bbox = ['912139', '7007303.5', '917389', '7014728.5']

class TestMapfishPrintInvalidRequest(BaseMapfishPrintTest):

    @attr('print')
    def test_response(self):
        with self.client as c:
            data = dict()
            resp = c.post('/export/map',
                          content_type='application/json',
                          data=json.dumps(data))

            self.assert400(resp)


class TestMapfishPrintMissingContentType(BaseMapfishPrintTest):

    @attr('print')
    def test_response(self):
        with self.client as c:
            data = self.prepare_data()
            resp = c.post('/export/map', data=json.dumps(data))

            self.assert400(resp)


class _BaseMapfishPrintBadParameterTest400(BaseMapfishPrintTest):

    @attr('print')
    def test_response(self):
        with self.client as c:
            data = self.prepare_data()
            resp = c.post('/export/map',
                          content_type='application/json',
                          data=json.dumps(data))

            self.assert400(resp)


class _BaseMapfishPrintBadParameterTest500(BaseMapfishPrintTest):

    @attr('print')
    def test_response(self):
        with self.client as c:
            data = self.prepare_data()
            resp = c.post('/export/map',
                          content_type='application/json',
                          data=json.dumps(data))
            print resp
            self.assert500(resp)


class TestMapfishPrintBadDPIRequest(_BaseMapfishPrintBadParameterTest400):
    test_dpi = 'foo'


class TestMapfishPrintBadScaleRequest(_BaseMapfishPrintBadParameterTest400):
    test_scale = 'foo'


class TestMapfishPrintInvalidLayerRequest(_BaseMapfishPrintBadParameterTest400):
    test_layers = 'foo'


class TestMapfishPrintBadBBOXRequest(_BaseMapfishPrintBadParameterTest400):
    test_bbox = 'foo'


class TestMapfishPrintInvalidBBOXRequest(_BaseMapfishPrintBadParameterTest400):
    test_bbox = ['foo', 'foo', 'foo', 'foo']


class TestMapfishPrintInvalidPageFormatRequest(_BaseMapfishPrintBadParameterTest500):
    test_page_layout = 'foo'


class TestMapfishPrintInvalidProjectionRequest(_BaseMapfishPrintBadParameterTest400):
    test_srs = 'foo'

# TODO update check output format
# class TestMapfishPrintInvalidOutputFormatRequest(_BaseMapfishPrintBadParameterTest500):
#     test_output_format = 'foo'
