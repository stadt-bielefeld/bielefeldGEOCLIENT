import os
from shell import shell
from munimap.application import create_app
from munimap.extensions import db
import click

config_file = os.getenv('FLASK_MUNIMAP_CONFIG', './configs/munimap.conf')
debug = os.getenv('FLASK_DEBUG', '0') == '1'
host = os.getenv('FLASK_RUN_HOST', '0.0.0.0')
port = os.getenv('FLASK_RUN_PORT', 5000)


app = create_app(config_file=config_file)
cli_manager = app.cli

@cli_manager.command()
def run_munimap():
    "Runs the development server with special configuration attributes"
    app.logger.info("Preparing to run munimap")
    app.logger.info(f"Starting application {app.name}")
    app.logger.info(f"Using {config_file} as config file")
    app.logger.info(f"Debugger is {debug}")
    app.run(host=host, port=int(port), debug=debug, threaded=True)

@cli_manager.command()
@click.option('--lang', default='de', help='selects language to initialize')
def babel_init_lang(lang='de'):
    "Initialize new language."
    shell('pybabel init -i ../munimap/translations/messages.pot -d ../munimap/translations -l %s' %
       (lang,))


@cli_manager.command()
def babel_refresh():
    "Extract messages and update translation files."
    shell('pybabel extract -F ../munimap/babel.cfg -k lazy_gettext -k _l -o ../munimap/translations/messages.pot ../munimap')
    shell('pybabel update -i ../munimap/translations/messages.pot -d ../munimap/translations')


@cli_manager.command()
def babel_compile():
    "Compile translations."
    shell('pybabel compile -d ../munimap/translations')


@cli_manager.command()
def create_db():
    "Creates database tables with fixtures"
    # create only on default bind
    db.create_all(bind=None)

    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config(app.config.get('ALEMBIC_CONF'))
    command.stamp(alembic_cfg, "head")


@cli_manager.command()
@click.option('--force', default=False, help='Drops all database tables')
def drop_db(force):
    "Drops all database tables"
    if force or not force and click.confirm("Are you sure ? You will lose all your data !"):
        app.logger.info("Dropping Database")
        # drop only on default bind
        db.drop_all(bind=None)
    else:
      app.logger.info("Database will be kept")


@cli_manager.command()
def recreate_db():
    "Drops all database tables and recreates a clean database structure"
    drop_db(force=True)
    create_db()
