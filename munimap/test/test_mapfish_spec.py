import yaml
import copy

from munimap.test.base import BaseTestClass
from munimap.print_requests import PrintRequest
from munimap.export.mapfish import create_spec_json, mapfish_layers


class TestMapfishSpecFile(BaseTestClass):

    test_bbox = [912139, 7007303.5, 917389, 7014728.5]
    test_srs = 3857
    test_layout = 'a4_portrait'
    test_output_format = 'pdf'
    test_layers = ['omniscale']
    test_mimetype = 'application/pdf'
    test_scale = 2500
    test_dpi = 300
    test_size = [297, 210]
    test_feature_collection = None

    def do_request(self):
        r = PrintRequest(
            bbox=self.test_bbox,
            scale=self.test_scale,
            layers=self.test_layers,
            output_format=self.test_output_format,
            dpi=self.test_dpi,
            page_layout=self.test_layout,
            srs=self.test_srs,
            # TODO renderGrid param
            page_size=self.test_size,
            mimetype=self.test_mimetype,
            index_layers=[],
            feature_collection=self.test_feature_collection
        )
        spec_file = create_spec_json(r)

        test_mapfish_layers = mapfish_layers(
            self.test_layers,
            self.test_bbox,
            self.test_srs,
            self.test_dpi
        )

        with open(spec_file, 'r') as f:
            # used yaml to load spec_content cause json loads all values as
            # unicode type and so comparing will fail
            spec_content = yaml.safe_load(f.read())
            return spec_content, test_mapfish_layers

    def test_mapfish_spec_file(self):
        spec_content, test_mapfish_layers = self.do_request()
        self.assertEqual(self.test_layout, spec_content['layout'])
        self.assertEqual(
            self.test_output_format,
            spec_content['outputFormat'])

        attributes = spec_content['attributes']

        map_config = attributes['mapConfig']
        self.assertEqual('EPSG:%d' % self.test_srs, map_config['projection'])
        self.assertEqual(self.test_dpi, map_config['dpi'])
        self.assertEqual(self.test_bbox, map_config['bbox'])
        assert str(self.test_scale) in attributes['scale']


class TestMapfishSpecFileWithMultipleLayers(TestMapfishSpecFile):
    test_layers = ['omniscale', 'omniscale_roads']


class TestMapfishSpecFileWithPrintLayer(TestMapfishSpecFile):
    test_layers = ['osm']

    def test_mapfish_spec_file(self):
        spec_content, test_mapfish_layers = self.do_request()
        self.assertEqual(self.test_layout, spec_content['layout'])
        self.assertEqual(
            self.test_output_format,
            spec_content['outputFormat'])

        attributes = spec_content['attributes']

        map_config = attributes['mapConfig']
        self.assertEqual(['osm_print'], map_config['layers'][1]['layers'])
        self.assertEqual('EPSG:%d' % self.test_srs, map_config['projection'])
        self.assertEqual(self.test_dpi, map_config['dpi'])
        self.assertEqual(self.test_bbox, map_config['bbox'])
        assert str(self.test_scale) in attributes['scale']


class TestMapfishSpecFileWithFeatureCollection(TestMapfishSpecFile):
    test_layers = []

    test_feature_collection = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'properties': {
                'style': {
                    'strokeColor': '#f00',
                    'strokeOpacity': 1,
                    'strokeWidth': 5,
                    'strokeDasharray': 'solid',
                    'fillColor': '#0f0',
                    'fillOpacity': 0.4,
                    'radius': 10
                }
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [
                    477596.46765,
                    5774028.03576
                ]
            }
        }]
    }

    def test_mapfish_spec_file(self):
        spec_content, test_mapfish_layers = self.do_request()
        self.assertEqual(self.test_layout, spec_content['layout'])
        self.assertEqual(
            self.test_output_format,
            spec_content['outputFormat'])

        attributes = spec_content['attributes']

        map_config = attributes['mapConfig']
        self.assertEqual('EPSG:%d' % self.test_srs, map_config['projection'])
        self.assertEqual(self.test_dpi, map_config['dpi'])
        self.assertEqual(self.test_bbox, map_config['bbox'])
        assert str(self.test_scale) in attributes['scale']
        assert map_config['layers'][1]['type'] == 'geojson'

        geojson_layer = map_config['layers'][1]

        assert len(geojson_layer['geoJson']['features']) == 1
        self.assertEqual(
            self.test_feature_collection['features'][0]['geometry'],
            geojson_layer['geoJson']['features'][0]['geometry'])
        assert geojson_layer['geoJson']['features'][0]['properties']['mapfishStyleId'] == 0
        assert geojson_layer['style']['styleProperty'] == 'mapfishStyleId'

        expected_style = copy.deepcopy(self.test_feature_collection['features'][0]['properties']['style'])
        expected_style.update({
            'strokeLinecap': 'round',
            'pointRadius': self.test_feature_collection['features'][0]['properties']['style']['radius']
        })

        self.assertEqual(geojson_layer['style']['0'], expected_style)
