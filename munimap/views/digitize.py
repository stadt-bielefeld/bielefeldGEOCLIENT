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

    added_some_features = False
    processed_features = []
    for geojson_feature in feature_collection.get('features'):
        if geojson_feature.get('id') is None:
            processed_features.append({
                'id': None,
                # bad request
                'status': 400
            })
            digitize_log.error(f'Cannot update single feature for layer {layer_name}. Id missing.')
            continue
        feature = Feature.by_layer_name_and_id(source_name, geojson_feature.get('id'))
        if feature is None:
            processed_features.append({
                'id': geojson_feature.get('id'),
                # not found
                'status': 404
            })
            digitize_log.error(f'Cannot update single feature for layer {layer_name}. '
                               f'Feature with id {geojson_feature.get("id")} not found.')
            continue
        if feature.is_newer_than(geojson_feature):
            processed_features.append({
                'id': geojson_feature.get('id'),
                # conflict
                'status': 409
            })
            continue
        if 'modified' in geojson_feature.get('properties'):
            del geojson_feature['properties']['modified']
        feature.update_from_geojson(geojson_feature)
        feature.modified_by = current_user.id
        db.session.add(feature)
        processed_features.append({
            'id': geojson_feature.get('id'),
            'status': 200
        })
        added_some_features = True

    if not added_some_features:
        abort(400)

    db.session.commit()
    successful_features = [f for f in processed_features if f.get('status') == 200]
    if len(successful_features) == len(processed_features):
        response = jsonify({
            'action': 'updated',
            'message': _('Features for %(title)s updated successfully', title=layer_name),
        })
        response.status_code = 200
    else:
        response = jsonify({
            'action': 'updated',
            'message': _('Not all changed features for %(title)s updated', title=layer_name)
        })
        # multi-status
        response.status_code = 207
    return response


@digitize.route('/features/delete', methods=['POST'])
def remove_features():
    if LocalProxyRequest.json is None:
        abort(400)
    layer_name = LocalProxyRequest.json.get('name')
    feature_collection = LocalProxyRequest.json.get('featureCollection')

    if layer_name is None or len(feature_collection.get('features')) == 0:
        abort(400)

    # checking layer permission
    lyr = current_app.layers.get(layer_name)
    if lyr is None:
        abort(404)

    source_name = lyr.get('source', {}).get('name')
    if source_name is None:
        abort(404)

    removed_some_features = False
    processed_features = []
    for geojson_feature in feature_collection.get('features'):
        if geojson_feature.get('id') is None:
            processed_features.append({
                'id': None,
                # bad request
                'status': 400
            })
            digitize_log.error(f'Cannot delete single feature for layer {layer_name}. Id missing.')
            continue
        feature = Feature.by_layer_name_and_id(source_name, geojson_feature.get('id'))
        if feature is None:
            processed_features.append({
                'id': geojson_feature.get('id'),
                # not found
                'status': 404
            })
            digitize_log.error(f'Cannot delete single feature for layer {layer_name}. '
                               f'Feature with id {geojson_feature.get("id")} not found.')
            continue
        if feature.is_newer_than(geojson_feature):
            processed_features.append({
                'id': geojson_feature.get('id'),
                # conflict
                'status': 409
            })
            continue

        db.session.delete(feature)
        processed_features.append({
            'id': geojson_feature.get('id'),
            'status': 200
        })
        removed_some_features = True

    if not removed_some_features:
        abort(400)

    db.session.commit()

    successful_features = [f for f in processed_features if f.get('status') == 200]
    if len(successful_features) == len(processed_features):
        response = jsonify({
            'action': 'deleted',
            'message': _('Features for %(title)s deleted successfully', title=layer_name),
        })
        response.status_code = 200
    else:
        response = jsonify({
            'action': 'deleted',
            'message': _('Not all provided features for %(title)s deleted', title=layer_name),
        })
        response.status_code = 207

    return response


@digitize.route('/features/modified_timestamps', methods=['GET'])
def features_modified_timestamps():
    name = LocalProxyRequest.args.get('layer')
    if not name:
        abort(400)
    layer_name = current_app.layers.get(name, {}).get('source', {}).get('name')
    if not layer_name:
        abort(400)
    feats = Feature.by_layer_name(layer_name)
    modified_list = Feature.get_modified_timestamps(feats)
    return jsonify(modified_list)


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
    # TODO add check for layer permission
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
