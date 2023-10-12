from datetime import datetime

from sqlalchemy.orm import column_property
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict

from geoalchemy2.shape import from_shape
from shapely.geometry import shape

from geoalchemy2.types import Geometry
from geoalchemy2.functions import ST_AsGeoJSON

from munimap.extensions import db

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
    modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, geojson=None):
        if geojson is not None:
            self.update_from_geojson(geojson)

    @property
    def geojson_feature(self):
        return {
            'id': self.id,
            'type': 'Feature',
            'geometry': self.geojson,
            'properties': {
                **self.properties,
                'modified': self.modified
            }
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
    def as_feature_collection(cls, features):
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
            id = str(style_id)
            base_feature = {
                'type': 'Feature',
                'properties': {
                    'mapfishStyleId': id,
                    '__layer__': feature.layer_name
                },
                'geometry': feature.geojson,
            }
            style = DEFAULT_STYLE.copy()
            style.update(layer['style'])
            # save the style intermediate to move them to the layer later
            base_feature['properties']['__style__'] = (id, style)
            style_id += 1
            _features.append(base_feature)

        return _features

    def update_from_geojson(self, geojson):
        # if feature has no properties, properties is None so default
        # value for get is never reached
        properties = geojson.get('properties')
        if properties is None:
            properties = {}
        try:
            del properties['style']
        except KeyError:
            pass
        try:
            del properties['_id']
        except KeyError:
            pass

        for key, value in properties.items():
            properties[key] = str(value)

        geometry = from_shape(shape(geojson['geometry']), srid=25832)
        self.geometry = geometry
        self.properties = properties
