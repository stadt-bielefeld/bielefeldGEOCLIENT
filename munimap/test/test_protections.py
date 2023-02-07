# -*- coding: utf-8 -*-


from munimap.test.base import BaseTestWithMunimapTestDB

from flask import url_for
from flask_login import current_user


# mapproxy with munimap/test/data/test_mapproxy.yaml must run to pass all tests
class TestProtectedLayer(BaseTestWithMunimapTestDB):

    def protected_wmts_url(self):
        protected_wmts = self.app.layers['wmts_protected']
        assert 'hash' in protected_wmts

        url = url_for(
            'munimap.wmts_proxy',
            url_hash=protected_wmts['hash']
        )

        url += 'wmts_protected/EPSG25832/8/105/108.png'

        return url

    def protected_wms_url(self):
        protected_wms = self.app.layers['wms_protected']
        assert 'hash' in protected_wms

        url = url_for(
            'munimap.wms_proxy',
            url_hash=protected_wms['hash']
        )

        url += '?'
        url += '&'.join([
            'SERVICE=WMS',
            'VERSION=1.3.0',
            'REQUEST=GetMap',
            'FORMAT=image/png',
            'TRANSPARENT=true',
            'LAYERS=wms_protected',
            'SRS=EPSG:25832',
            'CRS=EPSG:25832',
            'STYLES=',
            'WIDTH=715',
            'HEIGHT=1059',
            'BBOX=461335.68421518203,5754265.480964899,474979.69376408606,5774502.184203399'
        ])

        return url

    def test_wmts_without_login(self):
        url = self.protected_wmts_url()

        assert current_user.is_anonymous

        with self.client as c:
            resp = c.get(url)
            assert resp.status_code == 403

    def test_wms_without_login(self):
        url = self.protected_wms_url()

        assert current_user.is_anonymous

        with self.client as c:
            resp = c.get(url)
            assert resp.status_code == 403

    def test_wmts_with_login(self):
        url = self.protected_wmts_url()

        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'user@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url)
            assert resp.status_code == 200

    def test_wms_with_login(self):
        url = self.protected_wms_url()

        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'user@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url)
            assert resp.status_code == 200

    def test_wmts_with_login_forbidden(self):
        url = self.protected_wmts_url()

        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'admin@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url)
            assert resp.status_code == 403

    def test_wms_with_login_forbidden(self):
        url = self.protected_wms_url()

        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'admin@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url)
            assert resp.status_code == 403


class TestProtectedProject(BaseTestWithMunimapTestDB):

    def test_unprotected_app(self):
        with self.client as c:
            resp = c.get(url_for('munimap.index'))
            assert resp.status_code == 200

    def test_protected_app_without_login(self):
        with self.client as c:
            resp = c.get(url_for('munimap.index', config='protected_app'))
            self.assertStatus(resp, 302)
            assert resp.headers['Location'].startswith(url_for('user.login', _external=True))

    def test_protected_app_with_login_forbidden(self):
        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'admin@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url_for('munimap.index', config='protected_app'))
            self.assertStatus(resp, 403)

    def test_protected_app_with_login(self):
        with self.client as c:
            c.post(url_for('user.login'), data={
                'email': 'user@example.org',
                'password': 'secure'
            })

            assert current_user.is_authenticated

            resp = c.get(url_for('munimap.index', config='protected_app'))
            self.assertStatus(resp, 200)
