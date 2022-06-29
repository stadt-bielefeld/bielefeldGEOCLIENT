# -*- coding: utf-8 -*-


from munimap.test.base import BaseTestWithMunimapTestDB
from munimap.model import MBUser

from flask import url_for
from flask_login import current_user


class TestUserRegister(BaseTestWithMunimapTestDB):

    def login_regular_user(self, client):
        client.post(url_for('user.login'), data={
            'email': 'admin@example.org',
            'password': 'secure'
        })
        assert current_user.is_authenticated

    def test_failed_login_user(self):
        user = MBUser.by_email('admin@example.org')
        assert user.email == 'admin@example.org'

        with self.client as c:
            assert current_user.is_anonymous

            resp = c.post(url_for('user.login'), data={
                'email': 'admin@example.org',
                'password': 'wrong',
            })
            self.assert200(resp)
            assert current_user.is_anonymous

    def test_login_user_next(self):
        user = MBUser.by_email('admin@example.org')
        assert user.email == 'admin@example.org'

        with self.client as c:
            assert current_user.is_anonymous

            resp = c.post(url_for('user.login', next='http://example.org'), data={
                'email': 'admin@example.org',
                'password': 'secure',
            })
            self.assertStatus(resp, 302)
            assert current_user.is_authenticated

    def test_logout_user(self):
        with self.client as c:
            self.login_regular_user(c)
            resp = c.get(url_for('user.logout'))
            self.assertStatus(resp, 302)
            assert current_user.is_anonymous
