# -:- encoding: utf8 -:-

import json

from munimap.extensions import db
from munimap.helper import _l

from shapely.geometry import mapping
from geoalchemy2.shape import to_shape

__all__ = ['Layer']


DEFAULT_STYLE = {
    'radius': 5,
    'graphicRotation': 0,
    'strokeWidth': 2,
    'strokeColor': '#3399cc',
    'strokeOpacity': 1,
    'strokeDashstyle': 'solid',
    'fillColor': '#fff',
    'fillOpacity': 0.4,
    'fontColor': '#333',
    'fontSize': '10px',
    'fontWeight': 'normal',
    'fontRotation': 0,
}

DIGITIZE_COLORPICKER_PALETTE = [
    'rgb(255, 255, 255);',
    'rgb(0, 255, 255);',
    'rgb(0, 255, 0);',
    'rgb(255, 255, 0);',
    'rgb(255, 0, 0);',
    'rgb(255, 102, 0);',
    'rgb(0, 38, 128);',
    'rgb(96, 124, 191);',
    'rgb(89, 255, 255);',
    'rgb(0, 128, 255);',
    'rgb(0, 102, 0);',
    'rgb(133, 41, 204);',
    'rgb(255, 128, 0);',
    'rgb(204, 0, 51);',
    'rgb(0, 0, 0);',
    'rgb(102, 102, 102);',
    'rgb(153, 153, 153);'
]


class Layer(db.Model):
    __tablename__ = 'digitize_layers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    title = db.Column(db.String)
    _properties_schema = db.Column(db.String)
    _style = db.Column(db.String, default=json.dumps(DEFAULT_STYLE))

    feature_groups = db.relationship(
        'FeatureGroup',
        backref='layer',
        primaryjoin="Layer.id==FeatureGroup.layer_id",
        cascade='all, delete-orphan',
        single_parent=True,
        order_by="asc(FeatureGroup.id)"
    )

    @property
    def style_schema(self):
        style = self.style
        return {
            'type': 'object',
            'title': _l('Style'),
            'properties': {
                'radius': {
                    'title': _l('Radius'),
                    'type': 'number',
                    'minimum': 0,
                    'maximum': 20,
                    'default': style['radius']
                },
                'graphicRotation': {
                    'title': _l('rotation'),
                    'type': 'number',
                    'minimum': -180,
                    'maximum': 180,
                    'default': style.get('graphicRotation', DEFAULT_STYLE['graphicRotation'])
                },
                'strokeWidth': {
                    'title': _l('strokeWidth'),
                    'type': 'number',
                    'minimum': 0,
                    'maximum': 10,
                    'default': style['strokeWidth']
                },
                'strokeColor': {
                    'title': _l('strokeColor'),
                    'type': ['string', 'null'],
                    'format': 'color',
                    'default': style['strokeColor']
                },
                'strokeOpacity': {
                    'title': _l('opacity'),
                    'type': 'number',
                    'format': 'slider',
                    'minimum': 0,
                    'maximum': 1,
                    'default': style['strokeOpacity']
                },
                'strokeDashstyle': {
                    'title': _l('strokeDashstyle'),
                    'type': ['string', 'null'],
                    'default': style['strokeDashstyle']
                },
                'fillColor': {
                    'title': _l('fillColor'),
                    'type': ['string', 'null'],
                    'format': 'color',
                    'default': style['fillColor']
                },
                'fillOpacity': {
                    'title': _l('opacity'),
                    'type': 'number',
                    'format': 'slider',
                    'minimum': 0,
                    'maximum': 1,
                    'default': style['fillOpacity']
                }
            },
            'required': []
        }

    style_schema_form_options = [
        {
            'type': 'fieldset',
            'title': _l('Point styling'),
            'condition': 'geometryType === undefined || geometryType === \'Point\'',
            'items': [
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-5',
                    'items': [
                        {
                            'key': 'radius',
                            'type': 'slider',
                            'feedback': False,
                            'validationMessage': {
                                'number': _l('Value is not a valid number'),
                                101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                103: _l('Value must be lower or equal than {{schema.maximum}}')
                            },
                            'sliderOptions': {
                                'min': 1,
                                'max': 20,
                                'step': 1,
                                'unit': 'px'
                            }
                        }
                    ]
                },
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-5 col-xs-offset-2',
                    'items': [
                        {
                            'key': 'graphicRotation',
                            'type': 'slider',
                            'condition': 'geometryType === undefined',
                            'feedback': False,
                            'validationMessage': {
                                'number': _l('Value is not a valid number'),
                                101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                103: _l('Value must be lower or equal than {{schema.maximum}}')
                            },
                            # changes on sliderOptions have to be also done in templates/digitize/app/ng-templates/feature-icons.html
                            'sliderOptions': {
                                'min': -180,
                                'max': 180,
                                'step': 1,
                                'unit': '°'
                            }
                        }
                    ]
                }
            ]
        },
        {
            'type': 'fieldset',
            'title': _l('Stroke styling'),
            'items': [
                {
                    'type': 'section',
                    'items': [
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5',
                            'items': [
                                {
                                    'key': 'strokeColor',
                                    'feedback': False,
                                    'type': 'colorpicker',
                                    'colorFormat': 'hex',
                                    'spectrumOptions': {
                                        'allowEmpty': True,
                                        'preferredFormat': 'hex3',
                                        'showAlpha': False,
                                        'showInput': True,
                                        'showPalette': True,
                                        'palette': DIGITIZE_COLORPICKER_PALETTE
                                    }
                                }
                            ]
                        },
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5 col-xs-offset-2',
                            'items': [
                                {
                                    'key': 'strokeOpacity',
                                    'feedback': False,
                                    'type': 'slider',
                                    'sliderOptions': {
                                        'step': 0.01,
                                        'format': 'percent',
                                        'unit': '%'
                                    },
                                    'validationMessage': {
                                        'number': _l('Value is not a valid number'),
                                        101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                        103: _l('Value must be lower or equal than {{schema.maximum}}')
                                    }
                                }
                            ]
                        },
                    ]
                },
                {
                    'type': 'section',
                    'items': [
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5',
                            'items': [
                                {
                                    'key': 'strokeDashstyle',
                                    'feedback': False,
                                    'type': 'select',
                                    'titleMap': [
                                        {'value': 'solid', 'name': _l('solid')},
                                        {'value': 'dot', 'name': _l('dot')},
                                        {'value': 'dash', 'name': _l('dash')},
                                        {'value': 'dashdot', 'name': _l('dashdot')},
                                        {'value': 'longdash', 'name': _l('longdash')},
                                        {'value': 'longdashdot', 'name': _l('longdashdot')},
                                    ]
                                }
                            ]
                        },
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5 col-xs-offset-2',
                            'items': [
                                {
                                    'key': 'strokeWidth',
                                    'type': 'slider',
                                    'feedback': False,
                                    'validationMessage': {
                                        'number': _l('Value is not a valid number'),
                                        101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                        103: _l('Value must be lower or equal than {{schema.maximum}}')
                                    },
                                    'sliderOptions': {
                                        'min': 1,
                                        'max': 10,
                                        'step': 1,
                                        'unit': 'px'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            'type': 'fieldset',
            'title': _l('Fill styling'),
            'condition': 'geometryType === undefined || geometryType !== \'LineString\'',
            'items': [
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-5',
                    'items': [
                        {
                            'key': 'fillColor',
                            'feedback': False,
                            'type': 'colorpicker',
                            # 'htmlClass': 'col-xs-5',
                            'colorFormat': 'hex',
                            'spectrumOptions': {
                                'allowEmpty': True,
                                'preferredFormat': 'hex3',
                                'showAlpha': False,
                                'showInput': True,
                                'showPalette': True,
                                'palette': DIGITIZE_COLORPICKER_PALETTE
                            }
                        }
                    ]
                },
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-5 col-xs-offset-2',
                    'items': [
                        {
                            'key': 'fillOpacity',
                            'type': 'slider',
                            'sliderOptions': {
                                'step': 0.01,
                                'format': 'percent',
                                'unit': '%'
                            },
                            'feedback': False,
                            'validationMessage': {
                                'number': _l('Value is not a valid number'),
                                101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                103: _l('Value must be lower or equal than {{schema.maximum}}')
                            }
                        }
                    ]
                }
            ]
        },
        {
            'type': 'section',
            'htmlClass': 'col-xs-5',
            'condition': 'geometryType === undefined',
            'items': [
                {
                    'type': 'button',
                    'title': _l('Update'),
                    'style': 'btn-success',
                    'onClick': 'submitForm()'
                }
            ]
        }
    ]

    @property
    def label_schema(self):
        style = self.style
        return {
            'type': 'object',
            'title': _l('Labeling'),
            'properties': {
                'text': {
                    'title': _l('Label'),
                    'type': 'string'
                },
                'fontWeight': {
                    'title': _l('Font weight'),
                    'type': ['string', 'null'],
                    'default': style['fontWeight']
                },
                'fontSize': {
                    'title': _l('Font size'),
                    'type': ['string', 'null'],
                    'default': style['fontSize']
                },
                'fontColor': {
                    'title': _l('Font color'),
                    'type': ['string', 'null'],
                    'format': 'color',
                    'default': style['fontColor']
                },
                'fontRotation': {
                    'title': _l('rotation'),
                    'type': 'number',
                    'minimum': -180,
                    'maximum': 180,
                    'default': style.get('fontRotation', DEFAULT_STYLE['fontRotation'])

                }
            },
            'required': []
        }

    label_schema_form_options = [
        {
            'type': 'fieldset',
            'items': [
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-12',
                    'items': ['text']
                }
            ]
        },
        {
            'type': 'fieldset',
            'title': _l('Text styling'),
            'items': [
                {
                    'type': 'section',
                    'items': [
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5',
                            'items': [
                                {
                                    'key': 'fontColor',
                                    'feedback': False,
                                    'type': 'colorpicker',
                                    'colorFormat': 'hex',
                                    'spectrumOptions': {
                                        'allowEmpty': True,
                                        'preferredFormat': 'hex3',
                                        'showAlpha': False,
                                        'showInput': True,
                                        'showPalette': True,
                                        'palette': DIGITIZE_COLORPICKER_PALETTE
                                    }
                                }
                            ]
                        },
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5 col-xs-offset-2',
                            'items': [
                                {
                                    'key': 'fontSize',
                                    'feedback': False,
                                    'type': 'select',
                                    'titleMap': [
                                        {'value': '6px', 'name': '6px'},
                                        {'value': '8px', 'name': '8px'},
                                        {'value': '10px', 'name': '10px'},
                                        {'value': '12px', 'name': '12px'},
                                        {'value': '14px', 'name': '14px'},
                                        {'value': '16px', 'name': '16px'},
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    'type': 'section',
                    'items': [
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5',
                            'items': [
                                {
                                    'key': 'fontWeight',
                                    'feedback': False,
                                    'type': 'select',
                                    'titleMap': [
                                        {'value': 'normal', 'name': _l('Normal')},
                                        {'value': 'italic', 'name': _l('Italic')},
                                        {'value': 'bold', 'name': _l('Bold')}
                                    ]
                                }
                            ]
                        },
                        {
                            'type': 'section',
                            'htmlClass': 'col-xs-5 col-xs-offset-2',
                            'items': [
                                {
                                    'key': 'fontRotation',
                                    'type': 'slider',
                                    'feedback': False,
                                    'validationMessage': {
                                        'number': _l('Value is not a valid number'),
                                        101: _l('Value must be greater or equal than {{schema.minimum}}'),
                                        103: _l('Value must be lower or equal than {{schema.maximum}}')
                                    },
                                    'sliderOptions': {
                                        'min': -180,
                                        'max': 180,
                                        'step': 1,
                                        'unit': '°'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

    properties_schema_form_options = [
        {
            'type': 'fieldset',
            'items': [
                {
                    'type': 'section',
                    'htmlClass': 'col-xs-12',
                    'items': ['*']
                }
            ]
        }
    ]

    @classmethod
    def by_name(cls, name):
        q = cls.query.filter(cls.name == name)
        return q.first_or_404()

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first_or_404()

    @property
    def feature_collection(self):
        return {
            'type': 'FeatureCollection',
            'features': self.features,
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:EPSG::25832'
                }
            }
        }

    @property
    def features(self):
        _features = []

        for group in self.feature_groups:
            if group.active:
                _features += group.feature_collection['features']

        return _features

    @property
    def mapfish_features(self):
        _features = []

        # use an own index to increment on the group iterations
        style_id = 0
        for group in self.feature_groups:
            if group.active:
                for feature in group.features:
                    id = str(style_id)
                    base_feature = {
                        'type': 'Feature',
                        'properties': {
                            'mapfishStyleId': id
                        },
                        'geometry': {}
                    }

                    base_feature['geometry'] = mapping(to_shape(feature.geometry))
                    base_feature['properties']['__layer__'] = self.name

                    style = DEFAULT_STYLE.copy()
                    style.update(self.style)
                    style.update(feature.style)
                    if group.min_scale is not None:
                        style['minScale'] = group.min_scale
                    elif 'minScale' in style:
                        del style['minScale']
                    if group.max_scale is not None:
                        style['maxScale'] = group.max_scale
                    elif 'maxScale' in style:
                        del style['maxScale']
                    # save the style intermediate to move them to the layer later
                    base_feature['properties']['__style__'] = (id, style)
                    style_id += 1
                    _features.append(base_feature)

        return _features

    @property
    def properties_schema(self):
        return json.loads(self._properties_schema or '{"type": "object", "properties": {}}')

    @properties_schema.setter
    def properties_schema(self, value):
        self._properties_schema = json.dumps(value)

    @property
    def style(self):
        return json.loads(self._style or '{}')

    @style.setter
    def style(self, value):
        if len(value) == 0:
            self._style = ''
            return
        self._style = json.dumps(value)

    @property
    def properties(self):
        properties = []
        for key, options in self.properties_schema['properties'].items():
            properties.append({
                'name': key,
                'title': options['title']
            })
        return properties

    def add_property(self, options):
        properties_schema = self.properties_schema
        if options['name'] in properties_schema['properties']:
            raise ValueError
        properties_schema['properties'][options['name']] = {
            'type': 'string',
            'title': options['title']
        }
        self.properties_schema = properties_schema
