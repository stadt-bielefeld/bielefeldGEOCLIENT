
import time
import datetime
import requests 
from werkzeug.exceptions import BadRequest
import json

from flask import current_app
from flask.ext.login import current_user

import logging
log = logging.getLogger('munimap.token')

def request_security_session(url, params):
    ts = int(time.mktime(datetime.datetime.today().timetuple()))

    base_params = {
        'time': ts,
        'user': current_user.mb_user_name,
    }
    del params['baseurl']
    params.update(base_params)
    log.info('API-URL %s with params %s', url, params)

    r = requests.get(url, params=params)
    if not r.ok:
        log.info('BAD REQUEST - got session response %s', r.content)
        raise BadRequest()

    content = json.loads(r.content)
    log.info('got token response %s', content)
    return content['token']