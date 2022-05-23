# -:- encoding: utf8 -:-


import os
import fnmatch
import sys
import locale
import logging
import tempfile

import jinja2
import sass
import datetime
import webassets.filter
import traceback
from tempfile import NamedTemporaryFile
from threading import Lock

from flask import Flask, send_from_directory, request, \
    jsonify, redirect, url_for, make_response, render_template, \
    current_app
from flask_babel import Babel

from flask.json import JSONEncoder as BaseJSONEncoder
from speaklater import _LazyString

from munimap.config import DefaultConfig, TestConfig
from munimap.layers import (
    load_layers_config,
    create_anol_layers,
    create_mapfish_layers,
    create_featureinfo_layers
)
from munimap import model
from munimap.query import pq
from munimap.helper import request_for_static, nl2br, touch_last_changes_file
from munimap.model import DummyUser, MBUser
from munimap.extensions import db, login_manager, assets, mail


def create_app(config=None, config_file=None):
    app = ReverseProxiedFlask(__name__)
    # {{ }} is used by angular
    app.jinja_env.variable_start_string = '{$'
    app.jinja_env.variable_end_string = '$}'
    app.jinja_env.filters['nl2br'] = nl2br
    app.jinja_env.add_extension('jinja2.ext.loopcontrols')

    app.config.from_object(DefaultConfig())
    if app.testing:
        app.config.from_object(TestConfig())

    if config_file is not None:
        app.config.from_pyfile(os.path.abspath(config_file))

    if config is not None:
        app.config.from_object(config)

    tempfile.tempdir = app.config.get('TMP_DIR')

    # configure the jinja2 choiceloader to load templates from project folder
    template_loader = jinja2.ChoiceLoader([
        jinja2.FileSystemLoader(os.path.join(app.config.get('PROJECT_DIR'), 'templates')),
        app.jinja_loader,
    ])
    app.jinja_loader = template_loader

    # configure json_encoder to handle lazy gettext
    class LazyJSONEncoder(BaseJSONEncoder):
        def default(self, o):
            if isinstance(o, _LazyString):
                return str(o)
            return BaseJSONEncoder.default(self, o)

    app.json_encoder = LazyJSONEncoder

    configure_extensions(app)

    project_static_folder = os.path.join(app.config.get('PROJECT_DIR'), 'static')

    # overwrite application static function
    # now it searchs first in static folder of current project
    # if requested file is not found, it's delevired
    # from application static folder
    def _static(filename):
        folder = app.static_folder
        project_static_file = os.path.join(project_static_folder, filename)
        if os.path.exists(project_static_file):
            folder = project_static_folder
        return send_from_directory(folder, filename)

    app.view_functions['static'] = _static

    from munimap.views.munimap import munimap
    from munimap.views.vector import vector
    from munimap.views.export import export
    from munimap.views.frontend import frontend
    from munimap.views.user import user
    from munimap.views.admin import admin
    from munimap.views.alkis import alkis
    from munimap.views.api import api

    app.register_blueprint(frontend)
    app.register_blueprint(munimap)
    app.register_blueprint(vector)
    app.register_blueprint(export)
    app.register_blueprint(user)
    app.register_blueprint(admin)
    app.register_blueprint(alkis)
    app.register_blueprint(api)

    try:
        from munimap_digitize.views import digitize, digitize_admin, digitize_public
    except ImportError as exc:
        if 'munimap_digitize' not in str(exc):
            app.logger.error(traceback.format_exc(exc))
    else:
        app.logger.info('munimap_digitize loaded')
        app.register_blueprint(digitize)
        app.register_blueprint(digitize_admin)
        app.register_blueprint(digitize_public)

    try:
        from munimap_transport.views import transport
    except ImportError as exc:
        if 'munimap_transport' not in str(exc):
            app.logger.error(traceback.format_exc(exc))
    else:
        app.logger.info('munimap_transport loaded')
        app.register_blueprint(transport)

    with app.app_context():
        load_layers(app, app.config.get('LAYERS_CONF_DIR'), True)
    configure_layers_conf_reload(app, app.config.get('LAYERS_CONF_DIR'))

    # set global LC_COLLATE locale for sort order
    if sys.platform == 'darwin':
        # use LATIN1/ISO8859-1 on Mac OS X as UTF8 collate is broken
        locale.setlocale(locale.LC_COLLATE, 'de_DE.ISO8859-1')
    else:
        locale.setlocale(
            locale.LC_COLLATE, app.config.get('COLLATE_LOCALE', 'de_DE.UTF-8'))

    return app


def configure_extensions(app):
    mail.init_app(app)
    db.init_app(app)
    configure_login(app)
    configure_assets(app)
    configure_logging(app)
    configure_i18n(app)
    configure_template_filters(app)
    configure_errorhandlers(app)
    configure_context_processors(app)

def configure_context_processors(app):
    app.jinja_env.globals.update(base_config=app.config)
    app.jinja_env.globals['datetime'] = datetime.datetime


def configure_login(app):
    login_manager.init_app(app)

    # load anonymous user to check permisssions
    login_manager.anonymous_user = model.AnonymousUser

    @login_manager.user_loader
    def load_user(user_id):
        if request_for_static():
            return DummyUser(user_id)
        return MBUser.query.filter(MBUser.mb_user_id == user_id).first()

    @login_manager.user_loader
    def user_loader(user_id):
        """
        Given *user_id*, return the associated User object.

        :param user_id: user_id user to retrieve
        """
        user = MBUser.query.filter(MBUser.mb_user_id == user_id).first()
        if user.is_disabled:
            return None
        return user


def configure_assets(app):
    assets.app = app
    assets.init_app(app)

    # store assets within PROJECT_DIR
    if app.config.get('PROJECT_DIR'):
        assets.url = '/static/assets'
        assets.static_url_prefix = 'assets'
        assets.append_path(app.static_folder)
        assets.directory = os.path.join(app.config.get('PROJECT_DIR'), 'assets')

        # access to fonts loaded by css files ( ../fonts in css)
        @app.route('/static/assets/fonts/<path:filename>')
        def static_fonts(filename):
            return send_from_directory(
                os.path.join(app.static_folder, 'fonts'),
                filename)

        # access to images loaded by css files ( ../img in css)
        @app.route('/static/assets/img/<path:filename>')
        def static_img(filename):
            return send_from_directory(
                os.path.join(app.static_folder, 'img'),
                filename)

        @app.route('/static/assets/<path:filename>')
        def static_assets(filename):
            return send_from_directory(assets.directory, filename)

    if not app.debug:
        assets.cache = True

    class LibSassFilter(webassets.filter.Filter):
        name = 'libsass'
        max_debug_level = None

        def input(self, _in, out, source_path, output_path, **kw):
            out.write(_in.read())

        def output(self, _in, out, **kwargs):
            self._compile_sass(_in, out)

        def _compile_sass(self, _in, out, cd=None):
            f = NamedTemporaryFile(delete=False, suffix='.sass')
            f.write(_in.read().encode('utf-8'))
            f.close()
            compiled = sass.compile(filename=f.name)

            # remove temp file
            os.remove(f.name)
            out.write(compiled)

    webassets.filter.register_filter(LibSassFilter)

    def collect_project_files(folder, search_for):
        # iterate through project folder and save project files
        project_files = []
        for root, dirnames, filenames in os.walk(folder):
            for filename in fnmatch.filter(filenames, search_for):
                project_files.append(os.path.join(root, filename))
        return project_files

    def assign_project_files(content_list, project_files):
        new_bundle_content = []
        for index, content in enumerate(content_list):
            # replace files from project or add the original one
            overwrite = False
            for project_file in project_files:
                if content in project_file:
                    new_bundle_content.append(project_file)
                    overwrite = True
            if not overwrite:
                new_bundle_content.append(content)

        # append individual files from project
        for project_file in project_files:
            if project_file not in new_bundle_content:
                new_bundle_content.append(project_file)

        return tuple(new_bundle_content)

    try:
        project_sass_files = collect_project_files(os.path.join(app.config.get('PROJECT_DIR'), 'static', 'sass'), '*.sass')

        loader = webassets.loaders.YAMLLoader(app.config.get('ASSETS_BUNDLES_CONF'))
        for name, bundle in loader.load_bundles().items():
            if name == 'app-css' and app.config.get('ASSETS_MERGE_SASS'):
                # check if project overwrite some sass files
                bundle.contents = assign_project_files(list(bundle.contents), project_sass_files)

            assets.register(name, bundle)
    except webassets.env.RegisterError:
        # ignore errors when registering bundles multiple times
        if not app.testing:
            raise


def configure_logging(app):
    formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s ')

    def add_debug_logger(handler):
        handler.setFormatter(formatter)
        handler.setLevel(logging.DEBUG)
        app.logger.addHandler(handler)
        logging.getLogger("munimap").addHandler(handler)

    def add_transfer_logger(handler):
        handler.setLevel(logging.INFO)
        handler.setFormatter(formatter)

        transfer_logger = logging.getLogger('munimap.transfer')
        transfer_logger.setLevel(logging.INFO)
        transfer_logger.propagate = False
        transfer_logger.addHandler(handler)

    def add_alkis_logger(handler):
        handler.setLevel(logging.INFO)
        handler.setFormatter(formatter)

        alkis_logger = logging.getLogger('munimap.alkis')
        alkis_logger.setLevel(logging.INFO)
        alkis_logger.propagate = False
        alkis_logger.addHandler(handler)

    def add_token_logger(handler):
        handler.setLevel(logging.INFO)
        handler.setFormatter(formatter)

        token_logger = logging.getLogger('munimap.token')
        token_logger.setLevel(logging.INFO)
        token_logger.propagate = False
        token_logger.addHandler(handler)

    def add_error_logger(handler):
        handler.setLevel(logging.ERROR)
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)

    def add_proxy_logger(handler):
        handler.setLevel(logging.ERROR)
        handler.setFormatter(formatter)

        proxy_logger = logging.getLogger('munimap.proxy')
        proxy_logger.setLevel(logging.ERROR)
        proxy_logger.propagate = False
        proxy_logger.addHandler(handler)

    def add_layers_logger(handler):
        handler.setLevel(logging.WARN)
        handler.setFormatter(formatter)

        layers_logger = logging.getLogger('munimap.layers')
        layers_logger.setLevel(logging.ERROR)
        layers_logger.propagate = False
        layers_logger.addHandler(handler)

    def add_print_logger(handler):
        handler.setLevel(logging.INFO)
        handler.setFormatter(formatter)

        print_logger = logging.getLogger('munimap.print')
        print_logger.setLevel(logging.INFO)
        print_logger.propagate = False
        print_logger.addHandler(handler)

    log_both = 'LOG_MODE' not in app.config or app.config['LOG_MODE'] == 'BOTH'

    if log_both or app.config['LOG_MODE'] == 'FILES':
        debug_log = os.path.abspath(os.path.join(app.config['LOG_DIR'], app.config['DEBUG_LOG']))
        add_debug_logger(logging.FileHandler(debug_log))

        transfer_log = os.path.join(
            app.root_path,
            app.config['LOG_DIR'],
            app.config['TRANSFER_LOG']
        )
        add_transfer_logger(logging.FileHandler(transfer_log))

        alkis_log = os.path.join(
            app.root_path,
            app.config['LOG_DIR'],
            app.config['ALKIS_LOG']
        )
        add_alkis_logger(logging.FileHandler(alkis_log))

        token_log = os.path.join(
            app.root_path,
            app.config['LOG_DIR'],
            app.config['TOKEN_LOG']
        )
        add_token_logger(logging.FileHandler(token_log))

        error_log = os.path.abspath(os.path.join(app.config['LOG_DIR'], app.config['ERROR_LOG']))
        add_error_logger(logging.FileHandler(error_log))
        add_proxy_logger(logging.FileHandler(error_log))
        add_layers_logger(logging.FileHandler(error_log))
        add_print_logger(logging.FileHandler(error_log))

    if log_both or app.config['LOG_MODE'] == 'STDOUT':
        add_debug_logger(logging.StreamHandler(sys.stdout))
        add_transfer_logger(logging.StreamHandler(sys.stdout))
        add_alkis_logger(logging.StreamHandler(sys.stdout))
        add_token_logger(logging.StreamHandler(sys.stdout))
        add_error_logger(logging.StreamHandler(sys.stdout))
        add_proxy_logger(logging.StreamHandler(sys.stdout))
        add_layers_logger(logging.StreamHandler(sys.stdout))
        add_print_logger(logging.StreamHandler(sys.stdout))

    app.logger.setLevel(logging.DEBUG)


def configure_i18n(app):

    babel = Babel(app, default_timezone='Europe/Berlin')

    @babel.localeselector
    def get_locale():
        accept_languages = app.config.get('ACCEPT_LANGUAGES', ['en_GB'])
        return request.accept_languages.best_match(accept_languages,
            default=accept_languages[0])


def configure_template_filters(app):
    def datetime_frmt(dt):
        return dt.strftime('%d.%m.%Y, %H:%M')
    app.jinja_env.filters['format_datetime'] = datetime_frmt


def configure_errorhandlers(app):

    if app.testing:
        return

    @app.errorhandler(400)
    def bad_request(error):
        if request.is_json: # is_xhr is deprectaed
            response = jsonify(message='Bad Request')
            response.status_code = 400
            return response
        app.logger.error("Bad Request (400) for %s: %s", request, getattr(error, 'description', error))
        return make_response(render_template("munimap/errors/400.html"), 400)

    @app.errorhandler(401)
    def unauthorized(error):
        if request.is_json: # is_xhr is deprectaed
            response =  jsonify(message="Login required")
            response.status_code = 401
            return response
        app.logger.error("Unauthorized (401) for %s: %s", request, getattr(error, 'description', error))
        return redirect(url_for("user.login", next=request.url))

    @app.errorhandler(403)
    def forbidden(error):
        if request.is_json: # is_xhr is deprectaed
            response = jsonify( message='Not allowed')
            response.status_code = 403
            return response
        app.logger.error("Not allowed (403) for %s: %s", request, getattr(error, 'description', error))
        return make_response(render_template("munimap/errors/403.html"), 403)

    @app.errorhandler(404)
    def page_not_found(error):
        if request.is_json: # is_xhr is deprectaed
            response = jsonify(message='Page not found')
            response.status_code = 404
            return response
        app.logger.error("Not Found (404) for %s: %s", request, getattr(error, 'description', error))
        return make_response(render_template("munimap/errors/404.html"), 404)

    @app.errorhandler(500)
    def server_error(error):
        if request.is_json: # is_xhr is deprectaed
            response = jsonify(message='Internal Error')
            response.status_code = 500
            return response
        app.logger.error("Internal Error (500) for %s: %s", request, getattr(error, 'description', error))
        return make_response(render_template("munimap/errors/500.html", error=error), 500)


def layers_conf_needs_reload(config_folder, timestamp, protection_changed):
    if protection_changed:
        return True
    if not timestamp:
        return True
    m_time = os.path.getmtime('%s/%s' % (config_folder, 'last_changes'))
    if m_time > timestamp:
        return True
    return False


def configure_layers_conf_reload(app, config_folder):
    lock = Lock()

    @app.before_request
    def reload_layers_conf():
        if layers_conf_needs_reload(config_folder, current_app.layers_conf_mtime,
                                    current_app.layer_protection_changed):
            with lock:
                if layers_conf_needs_reload(config_folder,
                                            current_app.layers_conf_mtime,
                                            current_app.layer_protection_changed):
                    load_layers(app, config_folder)


def load_layers(app, config_folder, initial=False):
    app.logger.info('Loading layers_conf folder "%s"' % config_folder)
    try:
        layers_config, layers_list = load_layers_config(
            config_folder=config_folder,
            protected_layer_names=model.ProtectedLayer.layer_names(),
            proxy_hash_salt=app.config.get('PROXY_HASH_SALT'),
        )
    except Exception as ex:
        if initial:
            raise
        app.logger.warn(ex)
        return False

    pg_layers = pq.load_layers(
        layers_config,
        app.config.get('SQLALCHEMY_LAYER_DATABASE_URI'),
        db_schema=app.config.get('SQLALCHEMY_DATABASE_SCHEMA'),
        db_echo=app.config.get('SQLALCHEMY_ECHO'))
    anol_layers = create_anol_layers(
        layers_config, app.config.get('LAYERS_BASE_URL'))
    mapfish_layers = create_mapfish_layers(
        layers_config, app.config.get('LAYERS_BASE_URL'),
        app.config.get('MAPFISH_SERVICES_DEFAULT_PROTOCOL'))
    featureinfo_layers = create_featureinfo_layers(
        layers_config, app.config.get('LAYERS_BASE_URL'))

    # set new layers if all create_ functions succeeded
    app.layers = layers_config['layers']
    app.layers_list = layers_list
    app.hash_map = layers_config['hash_map']
    app.pg_layers = pg_layers
    app.anol_layers = anol_layers
    app.mapfish_layers = mapfish_layers
    app.featureinfo_layers = featureinfo_layers
    app.logger.info('Finished Folder "%s" loaded' % config_folder)

    if os.path.exists(('%s/%s' % (config_folder, 'last_changes'))):
        app.layers_conf_mtime = os.path.getmtime('%s/%s' % (config_folder, 'last_changes'))
    else:
        touch_last_changes_file()
    app.layer_protection_changed = False


class ReverseProxiedFlask(Flask):
    """
    Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.
    In nginx:
    location /prefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /prefix;
        }
    :param app: the WSGI application
    """
    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name and script_name != '/':
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]
        server = environ.get('HTTP_X_FORWARDED_SERVER_CUSTOM',
                     environ.get('HTTP_X_FORWARDED_HOST',
                         environ.get('HTTP_X_FORWARDED_SERVER', '')))
        if server:
            environ['HTTP_HOST'] = server

        scheme = environ.get('HTTP_X_FORWARDED_PROTO',
            environ.get('HTTP_X_SCHEME', ''))

        if scheme:
            environ['wsgi.url_scheme'] = scheme

        return Flask.__call__(self, environ, start_response)
