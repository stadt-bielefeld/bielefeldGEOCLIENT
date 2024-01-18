

import logging


from flask import (
    Blueprint,
    current_app,
    jsonify,
    abort,
    request as LocalProxyRequest
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
    api_access_receive_token = current_app.config.get('API_ACCESS_RECEIVE_TOKEN')

    if not api_access_receive_token:
        return abort(403)

    auth_header = LocalProxyRequest.headers.get('Authorization', '').split(' ')
    if len(auth_header) != 2:
        return abort(403)
    scheme, access_token = auth_header
    if scheme != 'munimap-token' or not access_token:
        return abort(403)

    access_allowed = access_token == api_access_receive_token
    if not access_allowed:
        if LocalProxyRequest.is_xhr:
            return jsonify(message='Not allowed')
        return abort(403)


@api.route('/update/map/config', methods=['POST'])
def update_map_config(path=None):
    file = LocalProxyRequest.files.get('upload_file', None)
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
    file = LocalProxyRequest.files.get('upload_file', None)
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
