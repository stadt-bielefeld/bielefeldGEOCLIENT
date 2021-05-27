import os
import os.path
from flask.ext.testing import TestCase

from munimap.application import create_app
from munimap.config import TestConfig
import sqlalchemy as sa

from munimap.extensions import db, assets
from munimap.queue.queue import SqliteQueue

from munimap.model import fixtures

here = os.path.dirname(__file__)

assets._named_bundles = {}
app = create_app(config=TestConfig)


class BaseTestClass(TestCase):

    def create_app(self):
        return app

    def setUp(self):
        pass


class BaseTestWithTestDB(BaseTestClass):

    def create_app(self):
        return app

    def setUp(self):
        BaseTestClass.setUp(self)

        uri = self.app.config.get('SQLALCHEMY_LAYER_DATABASE_URI')
        engine = sa.create_engine(uri)

        with engine.connect() as c:
            tr = c.begin()
            c.execute(open(os.path.join(os.path.dirname(__file__), 'data', 'test_db.sql')).read())
            tr.commit()


class BaseTestWithMunimapTestDB(BaseTestClass):

    def create_app(self):
        return app

    def setUp(self):
        BaseTestClass.setUp(self)

        uri = self.app.config.get('SQLALCHEMY_DATABASE_URI')
        self.engine = sa.create_engine(uri)

        db.drop_all()
        db.create_all()

        db.session.add_all(fixtures.test_data())
        db.session.commit()



class BaseTestWithPrintqueueDB(BaseTestClass):

    def create_app(self):
        return app

    def setUp(self):
        BaseTestClass.setUp(self)

        uri = self.app.config.get('PRINT_QUEUEFILE')
        self.print_db = SqliteQueue(uri)
        self.print_db.append({}, id=1)
        self.print_db.append({}, id=2, finished=True)
        success = {
            'output_file': os.path.join(
                here,
                'data/test_print_download_dummy_response.txt')
        }
        self.print_db.mark_done(2, success)

        self.print_db.append({}, id=3)
        error = {
            'error': 'unable to process job',
            'traceback': 'dummy traceback',
        }
        self.print_db.mark_done(3, error)

    def tearDown(self):
        uri = self.app.config.get('PRINT_QUEUEFILE')
        os.remove(uri)
