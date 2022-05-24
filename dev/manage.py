from asyncio.log import logger
import os
from scriptine.shell import sh
from munimap.application import create_app
from munimap.extensions import db

config_file = os.getenv('FLASK_MUNIMAP_CONFIG', './configs/munimap.conf')
app = create_app(config_file=config_file)
cli_manager = app.cli

@cli_manager.command()
def run_munimap():
    app.logger.info("Preparing to run munimap")
    app.logger.info(f"Starting applicatio {app.name}")
    app.logger.info(f"Using {config_file} as config file")
    app.run()

@cli_manager.command()
def babel_init_lang(lang='de'):
    "Initialize new language."
    sh('pybabel init -i ../munimap/translations/messages.pot -d ../munimap/translations -l %s' %
       (lang,))


@cli_manager.command()
def babel_refresh():
    "Extract messages and update translation files."
    sh('pybabel extract -F ../munimap/babel.cfg -k lazy_gettext -k _l -o ../munimap/translations/messages.pot ../munimap ../munimap_digitize ../munimap_transport')
    sh('pybabel update -i ../munimap/translations/messages.pot -d ../munimap/translations')


@cli_manager.command()
def babel_compile():
    "Compile translations."
    sh('pybabel compile -d ../munimap/translations')


@cli_manager.command()
def recreate_db():
    drop_db(force=True)
    create_db()


@cli_manager.command()
def create_db():
    "Creates database tables with fixtures"
    # create only on default bind
    db.create_all(bind=None)

    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config(app.config.get('ALEMBIC_CONF'))
    command.stamp(alembic_cfg, "head")

    from munimap_digitize.model import fixtures
    db.session.add_all(fixtures.all())
    db.session.commit()


@cli_manager.command()
def drop_db(force=False):
    "Drops all database tables"
    if force or prompt_bool("Are you sure ? You will lose all your data !"):
        # drop only on default bind
        db.drop_all(bind=None)
