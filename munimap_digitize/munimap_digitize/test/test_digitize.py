import json

from flask import url_for

from munimap_digitize.test.base import BaseTestWithDigitizeDB
from munimap_digitize.model import Layer, FeatureGroup, Feature

from munimap_digitize.test.base import login_regular_user


class TestDigitize(BaseTestWithDigitizeDB):

    def test_get_layer(self):
        """
         load all features from a layer as featurecollection
        """
        with self.app.test_client() as c:
            login_regular_user(c)

            layer = Layer.query.first()
            featurecollection = layer.feature_collection
            resp = c.get(
                url_for('digitize_public.layer', name=layer.name)
            )
            self.assert200(resp)

            assert resp.json == featurecollection

    def test_get_feature_groups(self):
        """
         load all features from a feature group as a featurecollection
        """
        with self.app.test_client() as c:
            login_regular_user(c)

            group = FeatureGroup.by_id(1)
            featurecollection = group.feature_collection

            resp = c.get(
                url_for('digitize.group', id=group.id)
            )
            self.assert200(resp)

            assert resp.json == featurecollection

    def test_get_non_existing_layer(self):
        """
         load all features from a layer as featurecollection
        """
        with self.app.test_client() as c:
            login_regular_user(c)

            resp = c.get(
                url_for('digitize_public.layer', name='no-layer-with-this-name'),
                headers={
                    'Content-type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            )
            self.assert200(resp)

            resp_data = json.loads(resp.data)
            assert resp_data['message'] == 'Page not found'

    def test_remove_feature_groups(self):
        """
         load all features from a feature group as a featurecollection
        """
        with self.app.test_client() as c:
            login_regular_user(c)

            group = FeatureGroup.by_id(1)
            features = Feature.query.filter(Feature.feature_group == group).all()
            resp = c.delete(
                url_for('digitize.remove_feature_group', id=group.id)
            )

            self.assert200(resp)
            resp_data = json.loads(resp.data)
            assert resp_data['action'] == 'removed'

            group = FeatureGroup.query.filter(FeatureGroup.id == 1).first()
            assert group is None

            # check if also all features from the group are removed
            for feature in features:
                check = Feature.query.filter(Feature.id == feature.id).first()
                assert check is None
