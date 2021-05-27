from munimap.test.base import BaseTestClass

from munimap.views.munimap import prepare_layers_def


class TestAppLayersDef(BaseTestClass):

    def test_empty_app_config(self):
        app_config = {
            'backgrounds': {},
            'groups': {},
            'layers': {}
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)

        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 3)

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 2)

        for group in app_layers_def['overlays']:
            assert('layers' in group)
            assert(len(group['layers']) > 0)

    def test_excludes(self):
        app_config = {
            'backgrounds': {
                'exclude': ['omniscale_gray', 'omniscale_wmts']
            },
            'groups': {
                'exclude': ['secound']
            },
            'layers': {
                'exclude': ['station', 'garden', 'omniscale_roads']
            }
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)
        print app_layers_def['overlays']
        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 1)
        assert(app_layers_def['backgroundLayer'][0]['name'] == 'omniscale')

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 1)

        assert(app_layers_def['overlays'][0]['name'] == 'omniscale')
        assert(len(app_layers_def['overlays'][0]['layers']) == 1)
        assert(app_layers_def['overlays'][0]['layers'][0]['name'] == 'busstop')

    def test_explicit(self):
        app_config = {
            'backgrounds': {
                'explicit': ['omniscale']
            },
            # group will not be added because layers.explicit is defined and
            # contains no layer of group second
            'groups': {
                'explicit': ['second']
            },
            'layers': {
                'explicit': ['parks']
            }
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)
        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 1)
        assert(app_layers_def['backgroundLayer'][0]['name'] == 'omniscale')

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 1)

        assert(app_layers_def['overlays'][0]['name'] == 'third')
        assert(len(app_layers_def['overlays'][0]['layers']) == 1)
        assert(app_layers_def['overlays'][0]['layers'][0]['name'] == 'parks')

    def test_explicit_group(self):
        app_config = {
            'backgrounds': {
                # no background layer is included
                'explicit': [None]
            },
            'groups': {
                'explicit': ['second']
            },
            'layers': {}
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)
        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 0)

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 1)

        assert(app_layers_def['overlays'][0]['name'] == 'second')
        assert(len(app_layers_def['overlays'][0]['layers']) == 1)
        assert(app_layers_def['overlays'][0]['layers'][0]['name'] == 'garden')

    def test_include_layer(self):
        app_config = {
            'backgrounds': {},
            'groups': {},
            'layers': {
                'include': ['parks']
            }
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)
        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 3)

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 3)

        assert(app_layers_def['overlays'][0]['name'] == 'omniscale')
        assert(len(app_layers_def['overlays'][0]['layers']) == 4)

        assert(app_layers_def['overlays'][1]['name'] == 'second')
        assert(len(app_layers_def['overlays'][1]['layers']) == 1)
        assert(app_layers_def['overlays'][2]['name'] == 'third')
        assert(len(app_layers_def['overlays'][2]['layers']) == 1)
        assert(app_layers_def['overlays'][2]['layers'][0]['name'] == 'parks')

    def test_include_layer_exclude_group(self):
        app_config = {
            'backgrounds': {},
            'groups': {
                'exclude': ['omniscale']
            },
            'layers': {
                'include': ['parks']
            }
        }

        app_layers_def = prepare_layers_def(app_config, self.app.layers)
        assert('backgroundLayer' in app_layers_def)
        assert(len(app_layers_def['backgroundLayer']) == 3)

        assert('overlays' in app_layers_def)
        assert(len(app_layers_def['overlays']) == 2)

        assert(app_layers_def['overlays'][0]['name'] == 'second')
        assert(len(app_layers_def['overlays'][0]['layers']) == 1)
        assert(app_layers_def['overlays'][0]['layers'][0]['name'] == 'garden')
        assert(app_layers_def['overlays'][1]['name'] == 'third')
        assert(len(app_layers_def['overlays'][1]['layers']) == 1)
        assert(app_layers_def['overlays'][1]['layers'][0]['name'] == 'parks')
