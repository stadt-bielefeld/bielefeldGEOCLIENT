

import jinja2
import importlib.metadata

from flask import (
    Blueprint,
    render_template,
    abort,
    send_file,
)
from munimap.helper import plugin_file_path, tour_file_path, contextmenu_file_path

frontend = Blueprint('frontend', __name__)


@frontend.route('/pages/<name>')
def pages(name):
    try:
        app_version = importlib.metadata.version('munimap')
        release_link = f'https://github.com/stadt-bielefeld/bielefeldGEOCLIENT/releases/tag/{app_version}'
        documentation_link = f'https://stadt-bielefeld.github.io/bielefeldGEOCLIENT/{app_version}/index.html'
        return render_template(
            '/munimap/pages/%s.html' % (name),
            app_version=app_version,
            release_link=release_link,
            documentation_link=documentation_link
        )
    except jinja2.TemplateNotFound:
        abort(404)


@frontend.route('/plugins', defaults={'name': ''})
@frontend.route('/plugins/<string:name>')
def plugins(name):
    try:
        # name cannot contain a '/' so the following is ok:
        return send_file(plugin_file_path(name))
    except IOError:
        abort(404)


@frontend.route('/tours', defaults={'name': ''})
@frontend.route('/tours/<string:name>')
def tours(name):
    try:
        # name cannot contain a '/' so the following is ok:
        return send_file(tour_file_path(name))
    except IOError:
        abort(404)


@frontend.route('/contextmenus', defaults={'name': ''})
@frontend.route('/contextmenus/<string:name>')
def contextmenus(name):
    try:
        # name cannot contain a '/' so the following is ok:
        return send_file(contextmenu_file_path(name))
    except IOError:
        abort(404)
