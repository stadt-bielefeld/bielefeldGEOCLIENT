

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
    access_allowed = False

    if not current_app.config.get('ALLOW_UPLOAD_CONFIG'):
        return abort(403)

    requested_ip = LocalProxyRequest.headers.get('X-Forwarded-For', False)
    if current_app.config.get('DEBUG'):
        requested_ip = '127.0.0.1'

    whitelist = current_app.config.get('ALLOW_UPLOAD_CONFIG', [])
    # x-forwarded-for header may contain a comma separated list of IPs.
    # So we have to check if any of those IP addresses is in our whitelist.
    requested_ips = requested_ip.split(',')
    in_allowed_list = any([True for ip in requested_ips if ip.strip() in whitelist])
    if in_allowed_list:
        access_allowed = True

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
