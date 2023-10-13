

import os
import json
import requests

from werkzeug.exceptions import BadRequest, Forbidden, NotFound, BadGateway

from flask import (
    Blueprint,
    Response,
    render_template,
    current_app,
    request,
    jsonify,
    abort,
    send_from_directory,
    flash,
    url_for,
    make_response,
    redirect,
    session,
)

from flask_login import current_user
from urllib3.exceptions import InsecureRequestWarning
from urllib.parse import urlencode

from munimap import helper
from munimap.app_layers_def import (
    prepare_layers_def,
    prepare_draw_layers_def,
    prepare_catalog_layers_def, 
    prepare_catalog_layers_name,
    catalog_layer_by_name,
    catalog_group_by_name,
)
from munimap.helper import apply_selectionlists_to_geoeditor
from munimap.layers import add_layers_base_url
from munimap.model import ProtectedProject, draw_schema
from munimap.lib.yaml_loader import load_yaml_file
from munimap.model import ProjectSettings
from munimap.token import request_security_session
from munimap.stats import log_stats

import logging
proxy_log = logging.getLogger('munimap.proxy')

munimap = Blueprint('munimap', __name__)

def list_available_icons():
    draw_icons_path = os.path.join(
        current_app.config['MAP_ICONS_DIR'],
        current_app.config['DRAW_ICONS_SUB_DIR']
    )
    icon_files = [(f.decode('utf-8') if not isinstance(f, str) else f) for f in os.listdir(draw_icons_path)]

    config_file = current_app.config.get('DRAW_ICONS_CONFIG_FILE')
    if config_file:
        config = load_yaml_file(config_file)

    icons = []
    if config_file:
        for icon in config['icons']:
            if icon['name'] in icon_files:
                width, height = icon['size']
                graphicXAnchor, graphicYAnchor = icon.get('anchor', [9, 9])
                icons.append({
                    'filename': icon['name'],
                    'height': height,
                    'width': width,
                    'graphicXAnchor': graphicXAnchor,
                    'graphicYAnchor': graphicYAnchor
                })
            else:
                file_name = os.path.join(draw_icons_path, icon['name'])
                current_app.logger.warn('A configured icon file does not exist on the filesystem! path to file: %s' %
                                        (file_name))

    return icons


@munimap.route('/')
@munimap.route('/app/<config>/')
@log_stats(request, current_user, route_name='munimap.index')
def index(config=None):
    if config: 
        project = ProtectedProject.by_name_without_404(config)
        if project is not None:
            if current_user.is_anonymous:
                flash(
                    helper._('You are not allowed to open this app.'),
                    'error'
                )
                return redirect(url_for('user.login', next=request.url))

            if not helper.check_project_permission(project):
                abort(403)

    try:
        app_config = helper.load_app_config(config)
    except helper.InvalidAppConfigError as ex:
        return render_template('munimap/errors/app_config_error.html',
                               error=ex)
    layers_def = prepare_layers_def(app_config, current_app.layers)
    draw_layers_def = prepare_draw_layers_def(app_config, current_app.layers)

    token = None
    if app_config.get('securityToken'):
        if current_user.is_anonymous:
            return redirect(url_for('user.login', next=request.url))
        else:
            token_url = app_config.get('securityToken').get('baseurl')
            token = request_security_session(
                token_url, 
                app_config.get('securityToken')
            )
    # set name for default map for config
    if not config:
        config = 'default'
    project_settings = []
    if not current_user.is_anonymous:
        for p_settings in current_user.project_settings:
            if p_settings.project == config:
                project_settings.append( { 'id': p_settings.id, 'name': p_settings.name })

    selected_settings = {}
    settings_id = session.get('project_setting_id', False)

    if settings_id:
        selected_settings = ProjectSettings.by_id_without_404(settings_id)
        selected_settings = json.loads(selected_settings.settings)
        session.pop('project_setting_id')

    try:
        apply_selectionlists_to_geoeditor(app_config)
    except helper.InvalidAppConfigError as ex:
        ex.filename = config
        return render_template('munimap/errors/app_config_error.html',
                           error=ex)

    app = app_config.get('app')

    cache_control_header = 'no-store,no-cache,must-revalidate,max-age=0,post-check=0,pre-check=0'
    pragma_header = 'no-cache'

    if app.get('iframe', False):
        iframe_url = app_config['app']['iframe']
        if token:
            iframe_url = '%s?token=%s' % (iframe_url, token)
        rendered_iframe = render_template(
            '/munimap/app/iframe.html', 
            iframe_url=iframe_url,
            app_config=app_config,
            project_name=config
        )
        resp = Response(rendered_iframe)
        resp.headers['Cache-Control'] = cache_control_header
        resp.headers['Pragma'] = pragma_header
        return resp
    else:
        rendered_index = render_template(
            '/munimap/app/index.html',
            app_config=app_config,
            layers_def=layers_def,
            draw_layers=draw_layers_def,
            project_settings=project_settings,
            settings=selected_settings,
            street_index_layer=current_app.config.get('PRINT_STREET_INDEX_LAYER'),
            style_schema=draw_schema.style_schema,
            style_schema_form_options=draw_schema.style_schema_form_options,
            label_schema=draw_schema.label_schema,
            label_schema_form_options=draw_schema.label_schema_form_options,
            available_icons=list_available_icons(),
            project_name=config
        )
        resp = Response(rendered_index)
        resp.headers['Cache-Control'] = cache_control_header
        resp.headers['Pragma'] = pragma_header
        return resp


@munimap.route('/app/<config>/catalog')
@log_stats(request, current_user, route_name='munimap.catalog_names')
def catalog_names(config=None):
    if config: 
        project = ProtectedProject.by_name_without_404(config)
        if project is not None:
            if current_user.is_anonymous:
                flash(
                    helper._('You are not allowed to open this app.'),
                    'error'
                )
                return redirect(url_for('user.login', next=request.url))

            if not helper.check_project_permission(project):
                abort(403)

    if config == 'default':
        config = None
    try:
        app_config = helper.load_app_config(config)
    except helper.InvalidAppConfigError as ex:
        return render_template('munimap/errors/app_config_error.html',
                               error=ex)
                        
    if not app_config.get('components').get('catalog'):
        return jsonify(
            layers= {},
            groups= {},
        )

    catalog_layers_def = {};
    catalog_groups_def = {};

    layers_def = prepare_layers_def(app_config, current_app.layers)
    if app_config.get('components').get('catalog'):
        catalog_layers_def, catalog_groups_def = prepare_catalog_layers_name(
            layers_def, current_app.layers
        )

    return jsonify(
        layers=catalog_layers_def,
        groups=catalog_groups_def,
    )

@munimap.route('/app/<config>/catalog/load_names', methods=['POST'])
@log_stats(request, current_user, route_name='munimap.gfi_catalog_names')
def gfi_catalog_names(config=None):
    names = request.json.get('names', [])
    if config: 
        project = ProtectedProject.by_name_without_404(config)
        if project is not None:
            if current_user.is_anonymous:
                flash(
                    helper._('You are not allowed to open this app.'),
                    'error'
                )
                return redirect(url_for('user.login', next=request.url))

            if not helper.check_project_permission(project):
                abort(403)
                
    if config == 'default':
        config = None

    try:
        app_config = helper.load_app_config(config)
    except helper.InvalidAppConfigError as ex:
        return render_template('munimap/errors/app_config_error.html',
                               error=ex)
    layers = {};
    groups = {};

    layers_def = prepare_layers_def(app_config, current_app.layers)
    if app_config.get('components').get('catalog'):
        catalog_layers_def, catalog_groups_def = prepare_catalog_layers_name(
            layers_def, current_app.layers, selected=names
        )

    return jsonify(
        layers=catalog_layers_def,
        groups=catalog_groups_def,
    )

@munimap.route('/app/<config>/catalog/<_type>/<name>/')
@log_stats(request, current_user, route_name='munimap.catalog_layer')
def catalog_layer(config=None, _type=None, name=None):
    if config: 
        project = ProtectedProject.by_name_without_404(config)
        if project is not None:
            if current_user.is_anonymous:
                flash(
                    helper._('You are not allowed to open this app.'),
                    'error'
                )
                return redirect(url_for('user.login', next=request.url))

            if not helper.check_project_permission(project):
                abort(403)
                
    if config == 'default':
        config = None

    try:
        app_config = helper.load_app_config(config)
    except helper.InvalidAppConfigError as ex:
        return render_template('munimap/errors/app_config_error.html',
                               error=ex)
    layers = {};
    groups = {};

    layers_def = prepare_layers_def(app_config, current_app.layers)
    if not app_config.get('components').get('catalog'):
        return jsonify(
            layers=layers,
            groups=groups,
        )
    
    if _type == 'layer':
        layers, _ = catalog_layer_by_name(
            layers_def, current_app.layers, name
        )
        return jsonify(
            layers=layers
        )
    else:
        _, groups = catalog_group_by_name(
            layers_def, current_app.layers, name
        )
        return jsonify(
            groups=groups
        )
    
@munimap.route('/icons/<path:filename>')
def icons(filename):
    return send_from_directory(
        current_app.config.get('MAP_ICONS_DIR'),
        filename
    )


@munimap.route('/draw/icons/<path:filename>')
def draw_icons(filename):
    draw_icons_path = os.path.join(
        current_app.config['MAP_ICONS_DIR'],
        current_app.config['DRAW_ICONS_SUB_DIR']
    )
    return send_from_directory(
        draw_icons_path,
        filename
    )


@munimap.route('/proxy/featureinfo/', methods=['GET'])
@munimap.route('/proxy/featureinfo/<layer_name>/', methods=['GET'])
def featureinfo_proxy(layer_name=None):
    if layer_name is None:
        abort(404)
    if layer_name not in current_app.featureinfo_layers:
        abort(404)

    url = current_app.featureinfo_layers[layer_name]['url']

    requested_layer = request.args.get('QUERY_LAYERS')
    if requested_layer not in current_app.layers:
        proxy_log.error('unknown/unconfigured layer')
        raise BadRequest()

    layer = current_app.layers[requested_layer]

    request_args = dict(request.args)

    request_args['QUERY_LAYERS'] = layer['source']['layers']
    request_args['LAYERS'] = layer['source']['layers']

    if url.startswith('//'):
        url = request.environ['wsgi.url_scheme'] + ':' + url

    encoding = current_app.featureinfo_layers[layer_name]['encoding']

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    featureinfo_response = requests.get(url, params=request_args, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    if not featureinfo_response.status_code == requests.codes.ok:
        current_app.logger.debug('Request error')
        abort(404)

    # TODO encode with flask default encoding instead of fixed one
    return Response(
        featureinfo_response.content.decode(encoding).encode('utf-8'),
        mimetype='text/html',
    )


@munimap.route('/proxy/cors/<service>/', methods=['GET'])
def cors_proxy(service=None):

    if service is None:
        return abort(404)

    url = current_app.config.get('CORS_PROXY').get(service)
    if url is None:
        return abort(404)

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

    service_response = requests.get(url + request.query_string, verify=current_app.config.get('CERTIFICATE_VERIFY'))
    return Response(
        service_response.text,
        content_type=service_response.headers.get('content-type')
    )


@log_stats(request, current_user, use_referrer=True, url_from_response=True)
def handle_wms_get_map(service_url, layers, request):
    request_args = request.args
    requested_layers = []
    layer_names = []
    for layer in layers:
        requested_layers += layer['source']['layers']
        layer_names.append(layer['name'])
    requested_layers = ','.join(requested_layers)

    srs = layer['source']['srs']
    _format = layer['source']['format']

    # TODO define styles and transparent in layers_conf.yaml?
    # not defined in layers_conf.yaml
    styles = request_args.get('STYLES')
    transparent = request_args.get('TRANSPARENT')

    # openlayers add all parameters capitalized
    width = request_args.get('WIDTH')
    height = request_args.get('HEIGHT')
    bbox = request_args.get('BBOX')

    if None in (transparent, width, height, styles, bbox):
        proxy_log.error('request is missing on of transparent, width, height, styles or bbox')
        raise BadRequest()

    if len(bbox.split(',')) != 4:
        proxy_log.error('bbox needs to consist of 4 values')
        raise BadRequest()

    params = dict(
        SERVICE='WMS',
        VERSION='1.3.0',
        REQUEST='GetMap',
        FORMAT=_format,
        TRANSPARENT=transparent,
        LAYERS=requested_layers,
        STYLES=styles,
        SRS=srs,
        CRS=srs,
        WIDTH=width,
        HEIGHT=height,
        BBOX=bbox
    )

    proxy_log.debug('munimap layers: %s; url: %s; params: %s',
                    ', '.join(layer_names),
                    service_url,
                    str(params),)

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    response = requests.get(service_url, params, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    return response


@log_stats(request, current_user, use_referrer=True, url_from_response=True)
def handle_wms_get_legend(service_url, layers, request):
    request_args = request.args
    requested_layers = []
    layer_names = []
    for layer in layers:
        requested_layers += layer['source']['layers']
        layer_names.append(layer['name'])
    requested_layers = ','.join(requested_layers)

    params = dict(
        # anol uses same parameters for it's request
        SERVICE='WMS',
        VERSION='1.3.0',
        SLD_VERSION='1.1.0',
        REQUEST='GetLegendGraphic',
        FORMAT='image/png',
        LAYER=requested_layers
    )

    proxy_log.debug('munimap layers: %s; url: %s; params: %s',
                    ', '.join(layer_names), service_url, str(params))

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    response = requests.get(service_url, params, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    return response


@log_stats(request, current_user, use_referrer=True, url_from_response=True)
def handle_get_file(service_url, layers, request):
    request_args = request.args
    filename = request_args.get('GetFile')

    params = dict(
        GetFile=filename,
    )

    proxy_log.debug('munimap url: %s; params: %s', service_url, str(params))

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    response = requests.get(service_url, params, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    return response

@log_stats(request, current_user, use_referrer=True, url_from_response=True)
def handle_wms_get_feature_info(service_url, layers, request):
    request_args = request.args
    requested_layers = []
    layer_names = []
    for layer in layers:
        requested_layers += layer['source']['layers']
        layer_names.append(layer['name'])
    requested_layers = ','.join(requested_layers)
    
    srs = layer['source']['srs']
    _format = request_args.get('FORMAT')
    info_format = request_args.get('INFO_FORMAT')
    feature_count = request_args.get('FEATURE_COUNT', 1)
    transparent = request_args.get('TRANSPARENT')
    styles = request_args.get('STYLES')
    count_i = request_args.get('I')
    count_j = request_args.get('J')

    # openlayers add all parameters capitalized
    width = request_args.get('WIDTH')
    height = request_args.get('HEIGHT')
    bbox = request_args.get('BBOX')

    params = dict(
        # anol uses same parameters for it's request
        SERVICE='WMS',
        VERSION='1.3.0',
        REQUEST='GetFeatureInfo',
        FORMAT=_format,
        FEATURE_COUNT=feature_count,
        INFO_FORMAT=info_format,
        TRANSPARENT=transparent,
        LAYERS=requested_layers,
        QUERY_LAYERS=requested_layers,
        STYLES=styles,
        I=count_i,
        J=count_j,
        SRS=srs,
        CRS=srs,
        WIDTH=width,
        HEIGHT=height,
        BBOX=bbox        
    )

    proxy_log.debug('munimap layers: %s; url: %s; params: %s',
                    ', '.join(layer_names), service_url, str(params))

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    response = requests.get(service_url, params, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    if not response.ok:
        proxy_log.error('request failed with status %s. url: %s, params: %s',
                        response.status_code, service_url, str(params))
        raise BadGateway()

    return response

@munimap.route('/proxy/wms/<url_hash>/service', methods=['GET'])
def wms_proxy(url_hash=None):
    if url_hash is None or url_hash not in current_app.hash_map:
        proxy_log.error('proxy url hash unknown')
        raise NotFound()

    url = current_app.hash_map[url_hash]
    if url is None:
        proxy_log.error('proxy url not found by url_hash')
        raise NotFound()

    request_type = request.args.get('REQUEST')
    if request_type not in ('GetMap', 'GetLegendGraphic', 'GetFeatureInfo') and not request.args.get('GetFile'):
        proxy_log.error('wms request type is unknown')
        raise BadRequest()

    requested_layers = (
        request.args.get('LAYERS') if request_type in ('GetMap', 'GetFeatureInfo') else
        request.args.get('LAYER', None)
    )
    layers = []

    if request.args.get('GetFile'):
        request_type = 'GetFile'

    if requested_layers is None:
        proxy_log.error('no layers in request')
        raise BadRequest()
    requested_layers = requested_layers.split(',')

    for requested_layer in requested_layers:
        if requested_layer not in current_app.layers:
            proxy_log.error('unknown/unconfigured layer')
            raise BadRequest()
        layer = current_app.layers[requested_layer]
        if layer['hash'] != url_hash:
            raise BadRequest()
        if not helper.layer_allowed_for_user(layer):
            raise Forbidden()
        layers.append(layer)

    url = add_layers_base_url(
        url,
        current_app.config.get('LAYERS_BASE_URL'),
        request.scheme
    )

    if url.startswith('/'):
        url = request.url_root + url[1:]

    if request_type == 'GetMap':
        handle_response = handle_wms_get_map
    elif request_type == 'GetFeatureInfo':
        handle_response = handle_wms_get_feature_info
    elif request_type == 'GetLegendGraphic':
        handle_response = handle_wms_get_legend
    elif request_type == 'GetFile':
        handle_response = handle_get_file

    service_response = handle_response(url, layers, request)

    if not service_response.ok:
        proxy_log.error('Request failed with status %s. url: %s',
                        service_response.status_code, service_response.request.url)
        raise BadGateway()

    response = make_response(
        service_response.content
    )
    response.content_type = service_response.headers.get('content-type')
    response.headers['Cache-Control'] = 'private'
    return response

@log_stats(request, current_user, use_referrer=True,  url_from_response=True)
def handle_wmts(service_url, layer, request, grid, zoom, x, y):
    requested_layer = layer['source']['layer']
    # grid not replaced by layers grid, because js client determine which
    # matrix set (hq / normal) should be used
    _format = layer['source']['format'].split('/')[-1]

    url = add_layers_base_url(service_url, current_app.config.get('LAYERS_BASE_URL'),
                              request.scheme)

    if url.startswith('/'):
        url = request.url_root + url[1:]

    url_tmpl = '%(url)s/%(layer)s/%(grid)s/%(zoom)d/%(x)d/%(y)d.%(_format)s'

    full_service_url = url_tmpl % dict(url=url.rstrip('/'), layer=requested_layer,
                                  grid=grid, zoom=zoom, x=x, y=y,
                                  _format=_format)

    proxy_log.debug('munimap layer: %s; url: %s', layer['name'], full_service_url)

    if not current_app.config.get('CERTIFICATE_VERIFY'):
        requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
    service_response = requests.get(full_service_url, verify=current_app.config.get('CERTIFICATE_VERIFY'))

    return service_response

@munimap.route('/proxy/wmts/<url_hash>/service/', methods=['GET'])
@munimap.route('/proxy/wmts/<url_hash>/service/<layer>/<grid>/<int:zoom>/<int:x>/<int:y>.<__format>')
def wmts_proxy(url_hash=None, layer=None, grid=None, zoom=None, x=None, y=None, __format=None):
    if url_hash is None or url_hash not in current_app.hash_map:
        proxy_log.error('proxy url hash unknown')
        raise NotFound()

    if None in (layer, grid, zoom, x, y, __format):
        proxy_log.error('proxy request is missing parameters')
        raise BadRequest()

    url = current_app.hash_map[url_hash]

    if url is None:
        proxy_log.error('proxy url not found by url_hash')
        raise NotFound()

    if layer not in current_app.layers or url_hash != current_app.layers[layer]['hash']:
        proxy_log.error('layer is misconfigured')
        raise NotFound()

    layer = current_app.layers[layer]

    service_response = handle_wmts(url, layer, request, grid, zoom, x, y)

    if not service_response.ok:
        proxy_log.error('Request failed with status %s. url: %s',
                        service_response.status_code, service_response.request.url)
        raise NotFound()

    response = make_response(
        service_response.content
    )
    response.content_type = service_response.headers.get('content-type')
    response.headers['Cache-Control'] = 'private'
    return response


@munimap.route('/static_geojson/<path:filename>', methods=['GET'])
def static_geojson(filename):
    return send_from_directory(
        current_app.config.get('GEOJSON_DATA_PATH'),
        filename
    )
