# -:- encoding: utf8 -:-

from munimap.helper import _l

__all__ = [
    'style_schema', 'style_schema_form_options',
    'label_schema', 'label_schema_form_options'
]

default_style = {
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

colorpicker_palette = [
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
    'rgb(153, 153, 153);',
]

style_schema = {
    'type': 'object',
    'title': _l('Style'),
    'properties': {
        'radius': {
            'title': _l('Radius'),
            'type': 'number',
            'minimum': 0,
            'maximum': 20,
            'default': default_style['radius']
        },
        'graphicRotation': {
            'title': _l('rotation'),
            'type': 'number',
            'minimum': -180,
            'maximum': 180,
            'default': default_style['graphicRotation']
        },
        'strokeWidth': {
            'title': _l('strokeWidth'),
            'type': 'number',
            'minimum': 0,
            'maximum': 10,
            'default': default_style['strokeWidth']
        },
        'strokeColor': {
            'title': _l('strokeColor'),
            'type': ['string', 'null'],
            'format': 'color',
            'default': default_style['strokeColor']
        },
        'strokeOpacity': {
            'title': _l('opacity'),
            'type': 'number',
            'format': 'slider',
            'minimum': 0,
            'maximum': 1,
            'default': default_style['strokeOpacity']
        },
        'strokeDashstyle': {
            'title': _l('strokeDashstyle'),
            'type': ['string', 'null'],
            'default': default_style['strokeDashstyle']
        },
        'fillColor': {
            'title': _l('fillColor'),
            'type': ['string', 'null'],
            'format': 'color',
            'default': default_style['fillColor']
        },
        'fillOpacity': {
            'title': _l('opacity'),
            'type': 'number',
            'format': 'slider',
            'minimum': 0,
            'maximum': 1,
            'default': default_style['fillOpacity']
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
                            103: _l('Value must be lower or equal than {{schema.maximum}})')
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
                            103: _l('Value must be lower or equal than {{schema.maximum}})')
                        },
                        'sliderOptions': {
                            'min': -180,
                            'max': 180,
                            'step': 1,
                            'unit': u'°'
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
                                    'palette': colorpicker_palette
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
                                    103: _l('Value must be lower or equal than {{schema.maximum}})')
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
                                    103: _l('Value must be lower or equal than {{schema.maximum}})')
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
                        'colorFormat': 'hex',
                        'spectrumOptions': {
                            'allowEmpty': True,
                            'preferredFormat': 'hex3',
                            'showAlpha': False,
                            'showInput': True,
                            'showPalette': True,
                            'palette': colorpicker_palette
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
                            103: _l('Value must be lower or equal than {{schema.maximum}})')
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

label_schema = {
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
            'default': default_style['fontWeight']
        },
        'fontSize': {
            'title': _l('Font size'),
            'type': ['string', 'null'],
            'default': default_style['fontSize']
        },
        'fontColor': {
            'title': _l('Font color'),
            'type': ['string', 'null'],
            'format': 'color',
            'default': default_style['fontColor']
        },
        'fontRotation': {
            'title': _l('rotation'),
            'type': 'number',
            'minimum': -180,
            'maximum': 180,
            'default': default_style['fontRotation']

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
                                    'palette': colorpicker_palette
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
                                    {'value': 'bold', 'name': _l('Bold')},
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
