# -:- encoding: utf8 -:-
import logging
import requests
import os
import json
from flask import current_app, url_for


log = logging.getLogger('munimap.transfer')


def transfer_config(filename, type_='map'):
    log.info('update map config for %s', filename)
    if not os.path.exists(filename):
        return False

    files = {
        'upload_file': open(filename, 'rb'),
    }
    api_access_token = current_app.config.get('API_ACCESS_SEND_TOKEN')
    if api_access_token:
        files['access_token'] = api_access_token

    if type_ == 'map':
        url = "%s%s" % (
            current_app.config.get('API_PRODUCTION_URL'),
            url_for('api.update_map_config')
        ) 
    else:
        url = "%s%s" % (
            current_app.config.get('API_PRODUCTION_URL'),
            url_for('api.update_project_config')
        ) 

    log.info('send config to %s', url)

    r = requests.post(url, files=files)
    if not r.ok:
        return False
    content = json.loads(r.content)
    return content.get('success', False)

