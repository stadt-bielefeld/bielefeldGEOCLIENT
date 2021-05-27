from __future__ import absolute_import

import jinja2

from flask import (
    Blueprint,
    render_template,
    abort,
    send_file,
)
from munimap.helper import plugin_file_path

frontend = Blueprint('frontend', __name__)


@frontend.route('/pages/<name>')
def pages(name):
    try:
        return render_template('/munimap/pages/%s.html' % (name))
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

