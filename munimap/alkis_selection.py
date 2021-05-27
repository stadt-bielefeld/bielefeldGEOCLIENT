import requests 
import yaml
from flask import current_app

from munimap.helper import urlencode_params
from werkzeug.exceptions import BadRequest
from munimap.alkis import request_alkis_session

import logging
log = logging.getLogger('munimap.alkis')


def request_fs_via_owner(params):
    token = request_alkis_session()

    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'eigentuemerid': params.get('id', ''),
        'response': 'json'
    }

    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getFlurstueckeFromEigentuemer'
    r = requests.get(API_URL, params=params)

    log.info('request alkis info getFlurstueckeFromEigentuemer for %s', params.get('id', ''))
    log.info('API_URL %s', API_URL)
    if not r.ok:
        log.info('BAD REQUEST  %s', r.content)
        raise BadRequest()

    log.info('got alkis info response %s', r.content)
    content = yaml.safe_load(r.content)
    return content


def request_owner(params):

    token = request_alkis_session()

    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'nachnameoderfirma': params.get('name', ''),
        'vorname' : params.get('firstname', ''), 
        'namensbestandteil': params.get('component', ''),
        'response': 'json'
    }

    log.info('request alkis info getEigentuemer')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getEigentuemer?'
    params = urlencode_params(params)
    log.info('API_URL %s', API_URL + params)
    r = requests.get(API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()

    log.info('got alkis info response %s', r.content)
    content = yaml.safe_load(r.content)
    return content


def request_fs_via_fsk(params):
    token = request_alkis_session()
   
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'gemeindeschluessel': '05711000',
        'gemarkungsschluessel': params.get('district'),
        'flur': params.get('flur', '*'),
        'flurstuecksnummer': '%s/%s' % (params.get('name', '*'), params.get('number', '*')),
        'response': 'json'
    }  
    log.info('request alkis info getFlurstuecke')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getFlurstuecke?'

    params = urlencode_params(params)
    log.info('API_URL %s', API_URL + params)
    r = requests.get(API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()

    content = yaml.safe_load(r.content)
    return content


def request_fs_via_address(params):
    token = request_alkis_session()
    location = params.get('location', '')
    # location = location.replace(' ', '%20')

    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'gemeinde': '05711000',
        'schluesselgesamt': params.get('street', ''),
        'unverschluesselt': location,
        'hausnummer': params.get('housenumber', ''),
        'zusatz': params.get('additonal', ''),
        'response': 'json'
    }
    
    log.info('request alkis info getFlurstueckeFromLage')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getFlurstueckeFromLage?'

    params = urlencode_params(params)
    log.info('API_URL %s', API_URL + params)
    r = requests.get(API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()

    content = yaml.safe_load(r.content)
    return content


def request_gemeinden(token):
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'response': 'json'
    }
    log.info('request alkis info getGemeindeNamen')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getGemeindeNamen?'
    params = urlencode_params(params)
    log.info('API_URL %s', API_URL + params)
    r = requests.get(API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()
    content = yaml.safe_load(r.content)
    return content


def request_gemarkungen(token):
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'gemeindeschluessel': '05711000',
        'response': 'json'
    }
   
    log.info('request alkis info getGemarkungsNamen')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getGemarkungsNamen?'
    params = urlencode_params(params)
    log.info('API_URL %s', API_URL + params)

    r = requests.get(API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()

    content = yaml.safe_load(r.content)
    return content

def request_strassen(token):
    params = {
        'ipconnectid': current_app.config.get('IP_CONNECT_ID'),
        'token': token,
        'gemeindeschluessel': '05711000',
        'filter': '*',
        'response': 'json'
    }
    log.info('request alkis info getStrassenNamen')
    API_URL = current_app.config.get('ALKIS_INFO_URL') + 'getStrassenNamen?' 
    params = urlencode_params(params)
    r = requests.get(API_URL + params)
    log.info('API_URL %s', API_URL + params)

    if not r.ok:
        log.info('BAD REQUEST %s', r.content)
        raise BadRequest()

    content = yaml.safe_load(r.content)
    return content


