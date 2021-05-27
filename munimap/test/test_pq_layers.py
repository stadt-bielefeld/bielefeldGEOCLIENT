from munimap.test.base import BaseTestClass
from sqlalchemy.engine import Engine as SQLAlchemyEngine


class TestPQLayers(BaseTestClass):

    def test_layer(self):
        pg_layers = self.app.pg_layers

        self.assertEqual(
            len(pg_layers),
            5
        )

        pg_layer = pg_layers['garden']

        self.assertEqual(
            pg_layer['name'],
            'garden'
        )

        self.assertEqual(
            pg_layer['title'],
            'Garden'
        )

        self.assertEqual(
            pg_layer['source']['query'], "select * from munimaptest.osm_landusages where ST_Intersects(geometry, !bbox!) and type='garden'"
        )

        self.assertEqual(
            type(pg_layer['source']['db_engine']),
            SQLAlchemyEngine
        )
