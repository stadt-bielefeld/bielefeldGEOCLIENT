

import logging


from flask import (
    Blueprint,
    current_app,
    Request,
    jsonify,
    abort,
    request as LocalProxyRequet
)

from munimap.helper import (
    config_file_path,
    project_file_path, 
    touch_last_changes_file
)

log = logging.getLogger('munimap.transfer')

api = Blueprint('api', __name__, url_prefix='/api')


@api.before_request
def check_permission():
    access_allowed = False

    if not current_app.config.get('ALLOW_UPLOAD_CONFIG'):
        return abort(403)

    requested_ip = LocalProxyRequet.headers.get('X-Forwarded-For', False)
    if current_app.config.get('DEBUG'):
        requested_ip = '127.0.0.1'

    if requested_ip in current_app.config.get('ALLOW_UPLOAD_CONFIG'):
        access_allowed = True

    if not access_allowed:
        if LocalProxyRequet.is_xhr:
            return jsonify(message='Not allowed')
        return abort(403)


@api.route('/update/map/config', methods=['POST'])
def update_map_config(path=None):
    file = LocalProxyRequet.files.get('upload_file', None)
    if file:
        filename = file.filename
        log.info('get map config for %s', filename)
        config_file = config_file_path(filename)
        log.info('save map config to %s', config_file)
        file.save(config_file)
        touch_last_changes_file()
        return jsonify({'success': True})
    return jsonify({'success': False})


@api.route('/update/project/config', methods=['POST'])
def update_project_config(path=None):
    file = LocalProxyRequet.files.get('upload_file', None)
    if file:
        filename = file.filename
        filename, _ = filename.split('.')
        log.info('get project config for %s', file.filename)
        config_file = project_file_path(filename)
        log.info('save project config to %s', config_file)
        file.save(config_file)
        touch_last_changes_file()
        return jsonify({'success': True})
    return jsonify({'success': False})
