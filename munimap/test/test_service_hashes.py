from munimap.test.base import BaseTestClass
from munimap.views.munimap import prepare_layers_def

from flask import url_for


class TestServiceHashes(BaseTestClass):

    def test_layer_hashes(self):
        layers = self.app.layers

        hash_count = 0
        for layer in list(layers.values()):
            if layer['type'] in ['wms', 'wmts', 'tiledwms']:
                assert 'hash' in layer
                hash_count += 1
            else:
                assert 'hash' not in layer

        assert hash_count == 10

    def test_same_service_hash(self):
        layers = self.app.layers
        assert layers['osm']['hash'] == layers['osm_print']['hash']

    def test_source_from_hash(self):
        layers = self.app.layers
        hash_map = self.app.hash_map

        for layer in list(layers.values()):
            if layer['type'] in ['wms', 'wmts', 'tiledwms']:
                self.assertEqual(
                    layer['source']['url'],
                    hash_map[layer['hash']]
                )

    def test_anol_layers_url(self):
        layers = self.app.layers
        app_config = {
            'backgrounds': {},
            'groups': {},
            'layers': {}
        }

        app_layers_def = prepare_layers_def(app_config, layers)

        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 3)

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 2)

        for group in app_layers_def['overlays']:
            assert('layers' in group)
            assert(len(group['layers']) > 0)

        for layer in app_layers_def['backgroundLayer']:
            if layer['type'] in ['wms', 'tiledwms']:
                self.assertEqual(
                    layer['olLayer']['source']['url'],
                    url_for('munimap.wms_proxy', url_hash=layers[layer['name']]['hash'])
                )
            elif layer['type'] == 'wmts':
                self.assertEqual(
                    layer['olLayer']['source']['url'],
                    url_for('munimap.wmts_proxy', url_hash=layers[layer['name']]['hash'])
                )

        for group in app_layers_def['overlays']:
            for layer in group['layers']:
                if layer['type'] in ['wms', 'tiledwms']:
                    self.assertEqual(
                        layer['olLayer']['source']['url'],
                        url_for('munimap.wms_proxy', url_hash=layers[layer['name']]['hash'])
                    )
                elif layer['type'] == 'wmts':
                    self.assertEqual(
                        layer['olLayer']['source']['url'],
                        url_for('munimap.wmts_proxy', url_hash=layers[layer['name']]['hash'])
                    )
