from munimap.test.base import BaseTestClass


class TestAnolLayersDef(BaseTestClass):

    def test_anol_background_layers(self):
        layers_def = self.app.anol_layers

        assert(len(layers_def) == 2)

        assert('backgroundLayer' in layers_def)

        backgrounds = layers_def['backgroundLayer']

        assert(len(backgrounds) == 5)

        self.assertEqual(backgrounds[0], {
            'name': 'omniscale',
            'title': 'OSM Omniscale',
            'status': 'active',
            'isBackground': True,
            'olLayer': {
                'source': {
                    'format': 'image/png',
                    'params': {
                        'LAYERS': 'omniscale',
                        'SRS': 'EPSG:25832'
                    }
                }
            },
            'type': 'wms'
        })

        self.assertEqual(backgrounds[1], {
            'name': 'omniscale_gray',
            'title': 'OSM Omniscale Grayscale',
            'status': 'active',
            'isBackground': True,
            'olLayer': {
                'source': {
                    'format': 'image/png',
                    'params': {
                        'LAYERS': 'omniscale_gray',
                        'SRS': 'EPSG:25832'
                    }
                }
            },
            'type': 'wms'
        })

        self.assertEqual(backgrounds[2], {
            'name': 'omniscale_wmts',
            'title': 'Omniscale WMTS',
            'status': 'active',
            'isBackground': True,
            'olLayer': {
                'source': {
                    'format': 'image/png',
                    'extent': [243900, 4427757, 756099, 6655205],
                    'matrixSet': 'EPSG25832',
                    'projection': 'EPSG:25832',
                    'layer': 'omniscale_wmts'
                }
            },
            'type': 'wmts'
        })

    def test_anol_raster_overlay(self):
        layers_def = self.app.anol_layers
        assert('overlays' in layers_def)

        overlays = layers_def['overlays']

        assert(len(overlays) == 4)
        assert('layers' in overlays[0])
        assert(overlays[0]['name'] == 'omniscale')
        assert(overlays[0]['title'] == 'Omniscale')
        assert(overlays[0]['status'] == 'active')
        assert(len(overlays[0]['layers']) == 4)
        self.assertEqual(overlays[0]['layers'][0], {
            'name': 'omniscale_roads',
            'title': 'OSM Omniscale Roads',
            'status': 'active',
            'olLayer': {
                'source': {
                    'format': 'image/png',
                    'params': {
                        'LAYERS': 'omniscale_roads',
                        'SRS': 'EPSG:25832'
                    }
                },
                'visible': False
            },
            'type': 'wms'
        })

    def test_anol_vector_overlay(self):
        layers_def = self.app.anol_layers

        assert('overlays' in layers_def)

        overlays = layers_def['overlays']
        assert(len(overlays) == 4)

        assert('layers' in overlays[0])
        assert(overlays[0]['name'] == 'omniscale')
        assert(overlays[0]['title'] == 'Omniscale')
        assert(overlays[0]['status'] == 'active')
        assert(len(overlays[0]['layers']) == 4)

        self.assertEqual(overlays[0]['layers'][1], {
            'cluster': False,
            'createIndex': True,
            'name': 'garden',
            'title': 'Garden',
            'status': 'active',
            'type': 'dynamic_geojson',
            'olLayer': {
                'source': {
                    'additionalParameters': {
                        'layers': ['garden']
                    }
                },
                'visible': False
            },
            'style': {
                'strokeColor': '#f00',
                'strokeWidth': 1,
                'type': 'simple',
                'fillColor': '#0f0'
            }
        })

    def test_anol_layer_in_multiple_groups(self):
        layers_def = self.app.anol_layers

        assert('overlays' in layers_def)
        overlays = layers_def['overlays']
        assert(len(overlays) == 4)

        assert('layers' in overlays[0])
        assert('layers' in overlays[1])

        self.assertEqual(
            overlays[0]['layers'][1],
            overlays[1]['layers'][0]
        )
