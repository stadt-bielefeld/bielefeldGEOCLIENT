from munimap.test.base import BaseTestClass


class TestMapfishPrintLayers(BaseTestClass):

    def test_wms_layer(self):
        test_layer = self.app.mapfish_layers['omniscale']

        self.assertEqual(
            test_layer,
            {
                'type': 'WMS',
                'baseURL': 'http://maps.omniscale.net/wms/mapsosc-b697cf5a/default/service?',
                'imageFormat': 'image/png',
                'opacity': 1,
                'layers': ['osm'],
                'customParams': {}
            }
        )

    def test_wmts_layer(self):
        test_layer = self.app.mapfish_layers['omniscale_wmts']

        self.assertEqual(test_layer['type'], 'WMTS')

        self.assertEqual(test_layer['baseURL'], 'http://localhost:8080/wmts/{Layer}/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png')
        self.assertEqual(test_layer['imageFormat'], 'image/png')
        self.assertEqual(test_layer['layer'], 'osm')
        self.assertEqual(test_layer['matrixSet'], 'EPSG25832')

        self.assertEqual(len(test_layer['matrices']), 20)

    def test_vector_layer(self):
        test_layer = self.app.mapfish_layers['busstop']

        self.assertEqual(
            test_layer['type'],
            'geojson'
        )

        # set before layer is send to mapfish print
        self.assertEqual(
            test_layer['geoJson'],
            None
        )

        assert('opacity' not in test_layer)
        assert('style' in test_layer)
        assert('1' in test_layer['style'])

        self.assertEqual(
            test_layer['style']['version'],
            1
        )
        self.assertEqual(
            test_layer['style']['styleProperty'],
            'mapfishStyleId'
        )

    def test_vector_icon_style(self):
        test_layer = self.app.mapfish_layers['busstop']

        style = test_layer['style']['1']

        self.assertEqual(
            style,
            {
                'externalGraphic': 'bus-18.svg',
                'graphicWidth': 18,
                'graphicHeight': 18,
                'type': 'simple'
            }
        )

    def test_vector_polygon_style(self):
        test_layer = self.app.mapfish_layers['garden']

        style = test_layer['style']['1']

        self.assertEqual(
            style,
            {
                'fillColor': '#0f0',
                'strokeColor': '#f00',
                'strokeWidth': 1,
                'type': 'simple'
            }
        )

    def test_missing_wms_protocol(self):
        test_layer = self.app.mapfish_layers['omniscale_variable_wms_protocol']

        assert test_layer['baseURL'].startswith('http:')

    def test_missing_wmts_protocol(self):
        test_layer = self.app.mapfish_layers['omniscale_variable_wmts_protocol']

        assert test_layer['baseURL'].startswith('http:')
