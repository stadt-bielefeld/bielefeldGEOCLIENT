from sqlalchemy.orm import column_property
from sqlalchemy.dialects.postgresql import HSTORE
from sqlalchemy.ext.mutable import MutableDict

from geoalchemy2.shape import from_shape
from shapely.geometry import asShape

from geoalchemy2.types import Geometry
from geoalchemy2.functions import ST_AsGeoJSON

from munimap.extensions import db

__all__ = ['Feature']


class Feature(db.Model):
    __tablename__ = 'digitize_features'

    id = db.Column(db.Integer, primary_key=True)
    feature_group_id = db.Column(
        db.Integer,
        db.ForeignKey('digitize_feature_groups.id')
    )
    geometry = db.Column(Geometry('GEOMETRY', srid=25832))

    style = db.Column(MutableDict.as_mutable(HSTORE))
    properties = db.Column(MutableDict.as_mutable(HSTORE))

    geojson = column_property(ST_AsGeoJSON(geometry))

    def __init__(self, feature_group, geojson=False):
        self.feature_group = feature_group
        if geojson:
            self.update_from_geojson(geojson)

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first_or_404()

    def update_from_geojson(self, geojson):
        # if feature has no properties, properties is None so default
        # value for get is never reached
        properties = geojson.get('properties')
        if properties is None:
            properties = {}
        style = properties.get('style')
        try:
            del properties['style']
        except KeyError:
            pass
        try:
            del properties['_id']
        except KeyError:
            pass

        for key, value in properties.items():
            properties[key] = str(value.encode('utf-8'))

        geometry = from_shape(asShape(geojson['geometry']), srid=25832)
        self.geometry = geometry
        self.properties = properties

        if style is not None:
            for key, value in style.items():
                style[key] = str(value)
        self.style = style
