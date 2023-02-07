import os

from flask import (
    Blueprint, Request, jsonify, abort, url_for, render_template,
    current_app, redirect, flash, request as LocalProxyRequest
)

from flask_login import current_user
from flask_assets import Bundle

from munimap.extensions import db, assets
from munimap.helper import _, check_group_permission, load_app_config
from munimap.app_layers_def import prepare_layers_def
from munimap.lib.yaml_loader import load_yaml_file

from munimap_digitize.model import Layer, FeatureGroup, Feature


digitize = Blueprint(
    'digitize',
    __name__,
    template_folder='../templates',
    static_folder='../static',
    static_url_path='/static',
    url_prefix='/digitize'
)

# add assets for digitize application
assets.append_path(digitize.static_folder)

digitize_libs_css = Bundle(
    'css/bootstrap-slider.css',
    'css/bootstrap.vertical-tabs.css',
    'css/spectrum.css',
    output='digitize-libs-css.css'
)
assets.register('digitize-libs-css', digitize_libs_css)


@digitize.context_processor
def digitize_context_processor():
    def is_admin():
        return check_group_permission([
            current_app.config.get('DIGITIZE_ADMIN_GROUP')
        ])

    return dict(is_admin=is_admin)


@digitize.before_request
def check_permission():
    if current_user.is_anonymous:
        flash(_('You are not allowed to use the digitize module without a login'), 'error')
        return redirect(url_for('user.login', next=LocalProxyRequest.url))

    access_allowed = check_group_permission([
        current_app.config.get('DIGITIZE_ADMIN_GROUP'),
        current_app.config.get('DIGITIZE_EDIT_GROUP')
    ])

    if not access_allowed:
        if LocalProxyRequest.is_xhr:
            return jsonify(message='Not allowed')
        return abort(403)


@digitize.route('/group/<int:id>', methods=['GET'])
def group(id):
    group = FeatureGroup.by_id(id)
    return jsonify(group.resless_feature_collection)


@digitize.route('/group/<int:id>', methods=['DELETE'])
def remove_feature_group(id):
    group = FeatureGroup.by_id(id)
    db.session.delete(group)
    db.session.commit()
    return jsonify({
        'action': 'removed',
        'message': _('Removed feature group successfully'),
    })


@digitize.route('/features', methods=['POST'])
def features():
    if LocalProxyRequest.json is None:
        abort(400)

    # got group_id from name, because group_id is assigned as name
    # see 'digitizer' below
    group_id = LocalProxyRequest.json.get('name')
    feature_collection = LocalProxyRequest.json.get('featureCollection')

    if None in (group_id, feature_collection):
        abort(400)

    group = FeatureGroup.by_id(group_id)

    # TODO: Should all features be really deleted before creating? Why not adding only the new feature?
    # In case of error, all features will be deleted and none will be written.
    # Maybe refactor this 
    group.delete_all_features()

    features = feature_collection.get('features', [])

    for feature in features:
        feature = Feature(feature_group=group, geojson=feature)
        db.session.add(feature)
    db.session.commit()

    response = jsonify({
        'action': 'created',
        'message': _('%(title)s saved successfully', title=group.title),
    })
    response.status_code = 200
    return response


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


@digitize.route('/<name>')
def digitizer(name=None):
    layer = Layer.by_name(name)
    app_config = load_app_config('digitize')
    layers_def = prepare_layers_def(app_config, current_app.layers)
    draw_layers = []
    for group in layer.feature_groups:
        draw_layers.append({
            'title': group.title,
            # assigned group id to name, because anol layer needs a name
            # to handle layer things internaly correct
            'name': group.id,
            'active': group.active,
            'properties_schema': layer.properties_schema,
            'properties_schema_form_options': layer.properties_schema_form_options,
            'style': layer.style,
            'style_schema': layer.style_schema,
            'style_schema_form_options': layer.style_schema_form_options,
            'label_schema': layer.label_schema,
            'label_schema_form_options': layer.label_schema_form_options,
            'url': url_for('digitize.group', id=group.id)
        })
    return render_template('digitize/app/index.html', draw_layers=draw_layers,
                           layers_def=layers_def,
                           app_config=app_config,
                           available_icons=list_available_icons())


@digitize.route('/')
def index():
    return render_template('digitize/pages/index.html',
                           layers=Layer.query.all())
