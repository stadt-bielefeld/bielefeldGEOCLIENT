import requests
import json
import time, datetime

from flask import current_app
from flask_login import current_user
from munimap.helper import urlencode_params

from werkzeug.exceptions import BadRequest, BadGateway
from urllib3.exceptions import InsecureRequestWarning
import xml.etree.ElementTree as ET

import logging

log = logging.getLogger('munimap.alkis')


def parseGML(gmlfile, element):
    root = ET.fromstring(gmlfile)

    for layer in root.findall('./Flurstuecke_layer'):
        for feature in layer.findall('./Flurstuecke_feature'):
            if feature.find(element) is not None:
                return feature.find(element).text
    return None


def get_id_via_wms_get_feature_info(service_url, request_args, element='id'):
    requested_layers = ['Flurstuecke']

    srs = 'EPSG:25832'
    info_format = request_args.get('INFO_FORMAT', 'application/vnd.ogc.gml')
    feature_count = request_args.get('FEATURE_COUNT', 1)

    width = request_args.get('WIDTH')
    height = request_args.get('HEIGHT')
    bbox = request_args.get('BBOX')
    count_x = request_args.get('X')
    count_y = request_args.get('Y')

    params = dict(
        # anol uses same parameters for it's request
        SERVICE='WMS',
        VERSION='1.1.1',
        REQUEST='GetFeatureInfo',
        INFO_FORMAT=info_format,
        LAYERS=requested_layers,
        FEATURE_COUNT=feature_count,
        QUERY_LAYERS=requested_layers,
        SRS=srs,
        X=count_x,
        Y=count_y,
        WIDTH=width,
        HEIGHT=height,
        BBOX=bbox
    )

    log.info('munimap layers: %s; url: %s; params: %s',
             ', '.join(requested_layers), service_url, str(params))

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    response = requests.get(service_url, params, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    if not response.ok:
        log.info('request failed with status %s. url: %s, params: %s',
                 response.status_code, service_url, str(params))
        raise BadGateway()

    return parseGML(response.content, element)


def request_alkis_session():
    # if user is not in alkis_owner group 
    # we request alkis without owner informations

    ts = int(time.mktime(datetime.datetime.today().timetuple()))

    params = {
        '_': ts,
        'f': 'json',
        'urlToWAS': 'default',
        'user': 'guest',
    }

    if hasattr(current_user, 'with_alkis_owner') and current_user.with_alkis_owner:
        params = {
            '_': ts,
            'f': 'json',
            'urlToWAS': 'default',
            'user': current_user.mb_user_name,
        }

    log.info('request session')
    API_URL = current_app.config.get('ALKIS_SESSION_URL')
    log.info('API-URL %s', API_URL)
    log.info('with params')
    r = requests.get(API_URL, params=params)
    if not r.ok:
        log.info('BAD REQUEST - got session response %s', r.content)
        raise BadRequest()

    content = json.loads(r.content)
    session = content['session']
    if not isinstance(session, str):
        log.info('BAD REQUEST - got session response %s', session)
        raise BadRequest()

    log.info('got session response')
    return session


def request_alkis_info(alkis_id):
    token = request_alkis_session()
    params = {
        'id': alkis_id,
        'token': token,
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'art': 'html',
        'response': 'json'
    }

    log.info('request alkis info getFlurstuecksinfoDocument',)

    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getFlurstuecksinfoDocument'
    log.info('API_URL %s', API_URL)
    r = requests.get(API_URL, params=params)

    if not r.ok:
        log.info('BAD REQUST %s', r.content)
        raise BadRequest()

    content = json.loads(r.content)
    log.info('got alkis info response')

    return content
