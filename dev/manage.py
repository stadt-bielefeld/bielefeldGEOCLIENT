from os import path
from scriptine.shell import sh

from flask import current_app
from flask.ext.script import Manager, Server, prompt_bool
from flask.ext.assets import ManageAssets
from munimap.application import create_app
from munimap.extensions import db

manager = Manager(create_app)
manager.add_command("assets", ManageAssets())


@manager.command
def babel_init_lang(lang='de'):
    "Initialize new language."
    sh('pybabel init -i ../munimap/translations/messages.pot -d ../munimap/translations -l %s' %
       (lang,))


@manager.command
def babel_refresh():
    "Extract messages and update translation files."
    sh('pybabel extract -F ../munimap/babel.cfg -k lazy_gettext -k _l -o ../munimap/translations/messages.pot ../munimap ../munimap_digitize ../munimap_transport')
    sh('pybabel update -i ../munimap/translations/messages.pot -d ../munimap/translations')


@manager.command
def babel_compile():
    "Compile translations."
    sh('pybabel compile -d ../munimap/translations')


@manager.command
def recreate_db():
    drop_db(force=True)
    create_db()


@manager.command
def create_db():
    "Creates database tables with fixtures"
    # create only on default bind
    db.create_all(bind=None)

    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config(current_app.config.get('ALEMBIC_CONF'))
    command.stamp(alembic_cfg, "head")

    from munimap_digitize.model import fixtures
    db.session.add_all(fixtures.all())
    db.session.commit()


@manager.command
def drop_db(force=False):
    "Drops all database tables"
    if force or prompt_bool("Are you sure ? You will lose all your data !"):
        # drop only on default bind
        db.drop_all(bind=None)


@manager.command
def refresh_users():
    print "WARNING replacing user and passwords in database by config file values"
    from munimap.model import load
    from munimap.lib.yaml_loader import load_yaml_file
    config = load_yaml_file(
        path.join(current_app.config.get('CONFIG_PATH'), 'munimap_user_config.yaml')
    )
    load.create_config(config)


manager.add_option('-c', '--config', dest='config_file', required=False)
manager.add_command("runserver", Server(
    host='0.0.0.0',
    threaded=True,
    # extra_files=['munimap_develop.conf', 'data/layers_conf.yaml']
))

if __name__ == '__main__':
    manager.run()
