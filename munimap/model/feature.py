from datetime import datetime
import json

from sqlalchemy.orm import column_property
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict

from geoalchemy2.shape import from_shape
from shapely.geometry import shape

from geoalchemy2.types import Geometry
from geoalchemy2.functions import ST_AsGeoJSON

from munimap.extensions import db
from munimap.helper import _l
from munimap.model import MBUser

__all__ = ['Feature']

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


class Feature(db.Model):
    __tablename__ = 'digitize_features'

    id = db.Column(db.Integer, primary_key=True)
    layer_name = db.Column(db.String, index=True)
    geometry = db.Column(Geometry('GEOMETRY', srid=25832))

    properties = db.Column(MutableDict.as_mutable(JSONB))
    geojson = column_property(ST_AsGeoJSON(geometry))

    created = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer)
    modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    modified_by = db.Column(db.Integer)

    def __init__(self, geojson=None):
        if geojson is not None:
            self.update_from_geojson(geojson)

    @property
    def geojson_feature(self):
        return {
            'id': self.id,
            'type': 'Feature',
            'geometry': json.loads(self.geojson),
            'properties': {
                **self.properties,
                'modified': self.modified.isoformat(),
                'modified_by': self.get_modified_by_user_name(),
                'created': self.created.isoformat(),
                'created_by': self.get_created_by_user_name()
            }
        }

    @staticmethod
    def properties_schema_form_options(prop_def):
        items = [prop['name'] for prop in prop_def]
        static_items = [
            {
                'key': 'created_by',
                'type': 'plaintext'
            },
            {
                'key': 'created',
                'type': 'plaintext',
                'limitto': 10
            },
            {
                'key': 'modified_by',
                'type': 'plaintext'
            },
            {
                'key': 'modified',
                'type': 'plaintext',
                'limitto': 10
            }
        ]
        return [
            {
                'type': 'fieldset',
                'items': [
                    {
                        'type': 'section',
                        'htmlClass': 'col-xs-12',
                        'items': items + [
                            {
                                'type': 'section',
                                'htmlClass': 'col-xs-6 left-section',
                                'items': [static_items[0], static_items[1]]
                            },
                            {
                                'type': 'section',
                                'htmlClass': 'col-xs-6',
                                'items': [static_items[2], static_items[3]]
                            }
                        ]
                    }
                ]
            }
        ]

    def is_newer_than(self, geojson_feature):
        modified_iso = geojson_feature.get('properties', {}).get('modified')
        if not modified_iso:
            return True
        modified = datetime.fromisoformat(modified_iso)
        return self.modified > modified

    @staticmethod
    def properties_schema_from_prop_def(prop_def):
        properties = {}
        for prop in prop_def:
            if properties.get(prop['name']) is not None:
                continue
            p = {
                'title': _l(prop['label']) if prop['label'] else _l(prop['name'])
            }
            if prop['type'] == 'text':
                p['type'] = 'string'
            elif prop['type'] == 'select':
                p['type'] = 'string'
                p['enum'] = [option['value'] for option in prop['select']]
                # in order to add the labels of the select, we have to add a custom x-schema-form
                p['x-schema-form'] = {
                    'type': 'select',
                    'titleMap': [{'value': option['value'], 'name': _l(option['label'])} for option in prop['select']]
                }
            elif prop['type'] == 'int':
                p['type'] = 'integer'
            elif prop['type'] == 'float':
                p['type'] = 'number'
            elif prop['type'] == 'date':
                p['type'] = 'string'
                p['format'] = 'date'
            else:
                p['type'] = prop['type']

            properties[prop['name']] = p

        properties['created'] = {
            'title': _l('Created on'),
            'type': 'string'
        }
        properties['created_by'] = {
            'title': _l('Created by'),
            'type': 'string'
        }
        properties['modified'] = {
            'title': _l('Last modified on'),
            'type': 'string'
        }
        properties['modified_by'] = {
            'title': _l('Last modified by'),
            'type': 'string'
        }

        return {
            'type': 'object',
            'title': _l('Attributes'),
            'properties': properties
        }

    @classmethod
    def by_id(cls, feature_id):
        q = cls.query.filter(cls.id == feature_id)
        return q.first_or_404()

    @classmethod
    def by_layer_name(cls, layer_name):
        q = cls.query.filter(cls.layer_name == layer_name)
        return q.all()

    @classmethod
    def by_layer_name_and_id(cls, layer_name, feature_id):
        q = cls.query.filter(cls.id == feature_id, cls.layer_name == layer_name)
        return q.first()

    @staticmethod
    def as_feature_collection(features):
        return {
            'type': 'FeatureCollection',
            'features': [f.geojson_feature for f in features]
        }

    @classmethod
    def mapfish_features(cls, features, layer):
        _features = []

        # use a dedicated index to increment on the feature iterations
        style_id = 0
        for feature in features:
            style_id_str = str(style_id)
            base_feature = {
                'type': 'Feature',
                'properties': {
                    'mapfishStyleId': style_id_str,
                    '__layer__': feature.layer_name
                },
                'geometry': json.loads(feature.geojson),
            }
            style = DEFAULT_STYLE.copy()
            style.update(layer['style'])
            # save the style intermediate to move them to the layer later
            base_feature['properties']['__style__'] = (style_id_str, style)
            style_id += 1
            _features.append(base_feature)

        return _features

    @staticmethod
    def get_modified_timestamps(feats):
        return [{'id': f.id, 'modified': f.modified.isoformat()} for f in feats]

    def update_from_geojson(self, geojson):
        # if feature has no properties, properties is None so default
        # value for get is never reached
        properties = geojson.get('properties')
        if properties is None:
            properties = {}

        protected_keys = ['style', '_id', 'created', 'created_by', 'modified', 'modified_by']
        stripped_properties = {k: properties[k] for k in properties.keys() if k not in protected_keys}

        geometry = from_shape(shape(geojson['geometry']), srid=25832)
        self.geometry = geometry
        self.properties = stripped_properties

    def get_modified_by_user_name(self):
        user = MBUser.by_id_without_404(self.modified_by)
        if not user:
            return
        return user.name

    def get_created_by_user_name(self):
        user = MBUser.by_id_without_404(self.created_by)
        if not user:
            return
        return user.name
