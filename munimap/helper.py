import os
import re
import yaml
import glob
import urllib

from functools import wraps
from flask import request, abort, current_app, url_for

from flask.ext.login import current_user
from flask.ext.babel import gettext as _, lazy_gettext as _l
from sqlalchemy.orm import class_mapper

from munimap.model import ProtectedLayer

from munimap.extensions import db

from jinja2 import Markup, escape

__all__ = ['_', '_l']


class InvalidAppConfigError(Exception):
    def __init__(self, ex, filename):
        self.filename = filename
        self.position = None
        self.reason = None
        if hasattr(ex, 'problem_mark'):
            self.position = [
                ex.problem_mark.line + 1,
                ex.problem_mark.column + 1
            ]
        if hasattr(ex, 'problem'):
            self.reason = ex.problem

        super(InvalidAppConfigError, self).__init__(ex)


def request_for_static():
    if request.endpoint == 'static' or request.endpoint == 'favicon':
        return True
    else:
        return False


def required_roles(*roles):
    """"
    Decorater for views to check if user has the permissons
    to enter the view.

    Example:

    from munimap.helper import required_roles
    @user.route('/test/')
    @required_roles('edit')

    """
    def wrapper(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if check_user_permission(roles):
                return f(*args, **kwargs)
            return abort(403)
        return wrapped
    return wrapper


def check_group_permission(roles):
    for group in current_user.groups:
        if group.name in roles:
            return True
    return False


def check_project_permission(project):
    for group in current_user.groups:
        if group in project.groups:
            return True
    return False


def check_layer_permission(layer):
    return layer.has_user_permission(layer, current_user)


def check_layers_permission(layers):

    if len(layers) == 0:
        return []
    layer_names = [layer['name'] for layer in layers]

    sqlTpl = """
        SELECT
            distinct ON (mm_layer_id)
            l.name AS layerName
        FROM 
            mm_layer_group lg
        LEFT JOIN mb_user_mb_group ug ON lg.mb_group_id = ug.fkey_mb_group_id 
        LEFT JOIN mm_layers l ON lg.mm_layer_id = l.id
        WHERE
            l.name IN :layer_names
            AND
            ug.fkey_mb_user_id = :userId
        ;
        """

    result = db.session.execute(sqlTpl, {"userId": current_user.id, "layer_names": tuple(layer_names)}, mapper=class_mapper(ProtectedLayer))

    allowedLayerNames = [r for r, in result]

    filteredLayers = [layer for layer in layers if layer['name'] in allowedLayerNames]

    return filteredLayers


def layer_allowed_for_user(layer):
    if not layer['protected']:
        return True

    if current_user.is_anonymous:
        return False

    # raises 404 when layer not found
    protected_layer = ProtectedLayer.by_name(layer['name'])

    return check_layer_permission(protected_layer)


def layers_allowed_for_user(layers):
    allowedLayers = []
    layersToCheck = []

    for layer in layers:
        if not layer['protected']:
            allowedLayers.append(layer)
        elif current_user.is_anonymous:
            pass
        else:
            layersToCheck.append(layer)

    filteredLayers = check_layers_permission(layersToCheck)
    allowedLayers = allowedLayers + filteredLayers

    return allowedLayers


def merge_yaml_dicts(x, y):
    z = x.copy()
    z.update(y)
    return z

def merge_dict(child, parent):
    """
    Return `parent` dict with values from `child` merged in.
    Removes `child` values = None from `parent`
    """
    for k, v in child.iteritems():
        if v is None:
            del parent[k]
            continue
        if k not in parent:
            parent[k] = v
        else:
            if isinstance(parent[k], dict) and isinstance(v, dict):
                merge_dict(v, parent[k])
            else:
                parent[k] = v
    return parent

def load_app_config(config=None, without_404=False):
    default_config_file = os.path.join(os.path.abspath(
        current_app.config.get('APP_CONFIG_DIR')),
        current_app.config.get('DEFAULT_APP_CONFIG')
    )
    if not os.path.exists(default_config_file):
        current_app.logger.warn(
            'Default app config not found. (%s)' % default_config_file)
        default_config = {}
    else:
        try:
            default_config = yaml.load(open(default_config_file, 'r'))
        except yaml.YAMLError as ex:
            raise InvalidAppConfigError(
                ex, current_app.config.get('DEFAULT_APP_CONFIG'))
        default_config = default_config or {}

    if config is not None:
        sub_app_config_file = os.path.join(os.path.abspath(
            current_app.config.get('APP_CONFIG_DIR')),
            config + '.yaml'
        )
        if os.path.exists(sub_app_config_file):
            try:
                sub_app_config = yaml.load(open(sub_app_config_file, 'r'))
            except yaml.YAMLError as ex:
                raise InvalidAppConfigError(ex, config + '.yaml')
            app_config = merge_dict(
                sub_app_config, default_config)
        elif without_404:
            return None
        else:
            current_app.logger.warn(
                'App config %s not found' % sub_app_config_file)
            # requested app config not available
            abort(404)
    else:
        app_config = default_config

    if 'app' in app_config and 'headerLogo' in app_config['app']:
        app_config['app']['headerLogo'] = url_for(
            'static', filename=app_config['app']['headerLogo']
        )

    if 'printConfig' in app_config:
        app_config['printConfig']['pageMargins'] = current_app.config.get(
            'MAPFISH_PRINT_MAP_MARGINS', [0, 0, 0, 0]
        )

    return app_config


def apply_selectionlists_to_geoeditor(app_config, app_config_path):
    if app_config.get('geoeditor') is None:
        return
    if app_config.get('geoeditor').get('formFields') is None:
        return

    form_fields = app_config['geoeditor']['formFields']
    for geometry_fields in form_fields.values():
        for field in geometry_fields:
            if field['type'] != 'select' or not isinstance(field['select'], str):
                continue

            file_path = selectionlist_file_path(field['select'])

            if not os.path.exists(file_path):
                class PseudoYamlError:
                    def __init__(self):
                        self.problem = 'Referenced selectionlist %s does not exist' %field['select']
                err = PseudoYamlError()
                raise InvalidAppConfigError(err, app_config_path)

            try:
                selectionlist_config = yaml.load(open(file_path, 'r'))
            except yaml.YAMLError as ex:
                raise InvalidAppConfigError(ex, file_path)
            field['select'] = selectionlist_config

   
def config_file_path(name):
    return os.path.join(os.path.abspath(
        current_app.config.get('LAYERS_CONF_DIR')),
        name
    )


def project_file_path(name):
    return os.path.join(os.path.abspath(
        current_app.config.get('APP_CONFIG_DIR')),
        name + '.yaml'
    )


def selectionlist_file_path(name):
    return os.path.join(os.path.abspath(
        current_app.config.get('SELECTIONLISTS_CONFIG_DIR')),
        name + '.yaml'
    )


def plugin_file_path(name):
    return os.path.join(os.path.abspath(
        current_app.config.get('PLUGIN_DIR')),
        name + '.js'
    )


def list_projects():
    configs = glob.glob(os.path.join(os.path.abspath(
        current_app.config.get('APP_CONFIG_DIR')),
        '*.yaml'
    ))
    configs = [os.path.basename(c) for c in configs]
    configs = [os.path.splitext(c)[0] for c in configs]
    return configs


def list_selectionlists():
    configs = glob.glob(os.path.join(os.path.abspath(
        current_app.config.get('SELECTIONLISTS_CONFIG_DIR')),
        '*.yaml'
    ))
    configs = [os.path.basename(c) for c in configs]
    configs = [os.path.splitext(c)[0] for c in configs]
    return configs


def list_plugins():
    configs = glob.glob(os.path.join(os.path.abspath(
        current_app.config.get('PLUGIN_DIR')),
        '*.js'
    ))
    configs = [os.path.basename(c) for c in configs]
    configs = [os.path.splitext(c)[0] for c in configs]
    return configs


_paragraph_re = re.compile(r'(?:\r\n|\r|\n){2,}')


# found at http://flask.pocoo.org/snippets/28/
def nl2br(value, only_first=False):
    lines = _paragraph_re.split(escape(value))
    html_lines = [u'<p>%s</p>' % p.replace('\n', '<br>\n') for p in lines]

    if only_first and len(html_lines) > 0:
        result = html_lines[0]
    else:
        result = u'\n\n'.join(html_lines)
    return Markup(result)


def touch_last_changes_file(times=None):
    fname = '%s/%s' % (current_app.config.get('LAYERS_CONF_DIR'), 'last_changes')

    with open(fname, 'a'):
        os.utime(fname, times)


def urlencode_params(params):
    encoded_params = ''
    for param in params:
        encoded_params += param + '=' + params[param] + '&'
    return encoded_params
