from munimap.extensions import db
import json
from datetime import datetime

__all__ = ['FeatureGroup']


M_PER_PX = 0.00028


class FeatureGroup(db.Model):
    __tablename__ = 'digitize_feature_groups'

    id = db.Column(db.Integer, primary_key=True)
    layer_id = db.Column(db.Integer, db.ForeignKey('digitize_layers.id'))

    title = db.Column(db.String)
    _active = db.Column(db.Boolean)
    min_res = db.Column(db.Float)
    max_res = db.Column(db.Float)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)

    features = db.relationship(
        'Feature',
        backref='feature_group',
        single_parent=True,
        cascade='all, delete-orphan'
    )

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first_or_404()

    @property
    def min_scale(self):
        if self.min_res is None:
            return None
        return int(self.min_res / M_PER_PX)

    @min_scale.setter
    def min_scale(self, value):
        if value is None:
            self.min_res = None
        else:
            self.min_res = value * M_PER_PX

    @property
    def max_scale(self):
        if self.max_res is None:
            return None
        return int(self.max_res / M_PER_PX)

    @max_scale.setter
    def max_scale(self, value):
        if value is None:
            self.max_res = None
        else:
            self.max_res = value * M_PER_PX

    @property
    def active(self):
        if not self.has_daterange:
            return self._active
        return self.start_date <= datetime.now() <= self.end_date

    @active.setter
    def active(self, value):
        self._active = value

    @property
    def has_daterange(self):
        return self.start_date is not None and self.end_date is not None

    @property
    def finished(self):
        return self.end_date < datetime.now()

    def _prepare_feature_properties(self, feature, resless=False):
        properties = dict(feature.properties or {})

        if 'style' not in properties:
            properties['style'] = {}
        if feature.style is not None:
            properties['style'] = dict(feature.style)

        if not resless:
            if self.min_res is not None:
                properties['style']['minResolution'] = self.min_res
            elif 'minResolution' in properties['style']:
                del properties['style']['minResolution']

            if self.max_res is not None:
                properties['style']['maxResolution'] = self.max_res
            elif 'maxResolution' in properties['style']:
                del properties['style']['maxResolution']

        properties['_id'] = feature.id

        if not properties['style']:
            del properties['style']
        return properties

    @property
    def feature_collection(self):
        features = []

        for feature in self.features:
            properties = self._prepare_feature_properties(feature)
            features.append({
                'type': 'Feature',
                'geometry': json.loads(feature.geojson),
                'properties': properties
            })

        return {
            'type': 'FeatureCollection',
            'features': features,
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:EPSG::25832'
                }
            }
        }

    @property
    def resless_feature_collection(self):
        features = []

        for feature in self.features:
            properties = self._prepare_feature_properties(feature, True)
            features.append({
                'type': 'Feature',
                'geometry': json.loads(feature.geojson),
                'properties': properties
            })

        return {
            'type': 'FeatureCollection',
            'features': features,
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'urn:ogc:def:crs:EPSG::25832'
                }
            }
        }


    def delete_all_features(self):
        for feature in self.features:
            db.session.delete(feature)
        db.session.commit()
