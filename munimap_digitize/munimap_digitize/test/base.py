from flask.ext.login import current_user
from flask import url_for

from munimap.test.base import BaseTestClass
from munimap.extensions import db

from munimap_digitize.model import fixtures

from munimap.lib.yaml_loader import load_yaml_file


def login_regular_user(client):
    client.post(url_for('user.login'), data={
        'email': 'default@example.org',
        'password': 'secure'
    })
    assert current_user.is_authenticated


class BaseTestWithDigitizeDB(BaseTestClass):
    def setUp(self):
        BaseTestClass.setUp(self)

        db.drop_all()
        db.create_all()

        db.session.add_all(fixtures.all())
        db.session.commit()
