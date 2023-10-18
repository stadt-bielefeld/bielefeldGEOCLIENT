import os

from flask import (
    Blueprint, jsonify, abort, flash,
    current_app, send_from_directory,
    redirect, request as LocalProxyRequest,
    url_for
)

from flask_login import current_user

from munimap.extensions import db
from munimap.helper import _
from munimap.lib.yaml_loader import load_yaml_file
from munimap.model import Feature

import logging
digitize_log = logging.getLogger('munimap.digitize')

digitize = Blueprint(
    'digitize',
    __name__,
    url_prefix='/digitize'
)


@digitize.before_request
def check_permission():
    # users need to be logged in, in order to work with given endpoints
    if current_user.is_anonymous:
        flash(_('Access not allowed'), 'error')
        return redirect(url_for('user.login', next=LocalProxyRequest.url))


@digitize.route('/features', methods=['POST'])
def features():
    if LocalProxyRequest.json is None:
        abort(400)
    layer_name = LocalProxyRequest.json.get('name')
    feature_collection = LocalProxyRequest.json.get('featureCollection')

    if None in (layer_name, feature_collection):
        abort(400)

    # checking layer permission
    lyr = current_app.layers.get(layer_name)
    if lyr is None:
        abort(404)

    source_name = lyr.get('source', {}).get('name')
    if source_name is None:
        abort(404)

    for feature_json in feature_collection['features']:
        feature = Feature(geojson=feature_json)
        feature.layer_name = source_name
        feature.created_by = current_user.id
        feature.modified_by = current_user.id
        db.session.add(feature)
    db.session.commit()

    response = jsonify({
        'action': 'created',
        'message': _('Features for %(title)s added successfully', title=layer_name),
    })
    response.status_code = 200
    return response


@digitize.route('/features', methods=['PUT'])
def update_features():
    if LocalProxyRequest.json is None:
        abort(400)
    layer_name = LocalProxyRequest.json.get('name')
    feature_collection = LocalProxyRequest.json.get('featureCollection')

    if None in (layer_name, feature_collection):
        abort(400)

    # checking layer permission
    lyr = current_app.layers.get(layer_name)
    if lyr is None:
        abort(404)

    source_name = lyr.get('source', {}).get('name')
    if source_name is None:
        abort(404)

    added_some_feature = False
    for geojson_feature in feature_collection.get('features'):
        if geojson_feature.get('id') is None:
            digitize_log.error(f'Cannot update single feature for layer {layer_name}. Id missing.')
            continue
        feature = Feature.by_layer_name_and_id(source_name, geojson_feature.get('id'))
        if feature is None:
            digitize_log.error(f'Cannot update single feature for layer {layer_name}. '
                               f'Feature with id {geojson_feature.get("id")} not found.')
            continue
        if 'modified' in geojson_feature.get('properties'):
            del geojson_feature['properties']['modified']
        feature.update_from_geojson(geojson_feature)
        feature.modified_by = current_user.id
        db.session.add(feature)
        added_some_feature = True

    if not added_some_feature:
        abort(400)

    db.session.commit()

    response = jsonify({
        'action': 'updated',
        'message': _('Features for %(title)s updated successfully', title=layer_name),
    })
    response.status_code = 200
    return response


@digitize.route('/features', methods=['DELETE'])
def remove_features():
    pass


def list_available_icons():
    icon_files = os.listdir(current_app.config.get('DIGITIZE_ICONS_DIR'))

    config_file = current_app.config.get('DIGITIZE_ICON_CONFIG_FILE')
    if config_file:
        config = load_yaml_file(config_file)

    icons = []
    for file in icon_files:
        if not isinstance(file, str):
            file = file.decode('utf-8')
        if not file.endswith(".svg"):
            continue

        width, height = [18, 18]
        if config_file:
            for icon in config['icons']:
                if icon['name'] == file:
                    width, height = icon['size']

        icons.append({
            'filename': file,
            'height': height,
            'width': width,
        })

    return icons


@digitize.route('/layer/<name>', methods=['GET'])
def layer(name):
    feats = Feature.by_layer_name(name)
    feature_collection = Feature.as_feature_collection(feats)
    return jsonify(feature_collection)


@digitize.route('/icons/<path:filename>')
def icons(filename):
    # TODO check if we have to add a static property to the blueprint constructor
    return send_from_directory(
        current_app.config.get('DIGITIZE_ICONS_DIR'),
        filename
    )
