import os
from datetime import datetime, time

from flask import (
    Blueprint, jsonify, abort, url_for,
    redirect, flash, current_app,
    send_from_directory,
    request as LocalProxyRequest
)

import yaml

from flask_login import current_user

from munimap.extensions import db
from munimap.helper import _, check_group_permission
from munimap.lib.yaml_loader import load_yaml_file
from munimap.model import Feature


digitize = Blueprint(
    'digitize',
    __name__,
    url_prefix='/digitize'
)


@digitize.route('/admin/<name>/edit_properties', methods=['POST'])
def edit_properties(name=None):
    pass
    # layer = Layer.by_name(name)
    #
    # form = EditPropertiesForm.from_schema(layer.properties_schema)
    #
    # if form.validate_on_submit():
    #     schema = layer.properties_schema
    #     for key in schema['properties'].keys():
    #         schema['properties'][key]['title'] = form.data[key]
    #     layer.properties_schema = schema
    #     db.session.commit()
    #     flash(_('Property updated'), 'success')
    # else:
    #     for field_name, errors in form.errors.items():
    #         for error in errors:
    #             flash(field_name + ': ' + error, 'error')
    #
    # return redirect(url_for('.properties', name=name))


@digitize.route('/admin/<name>/add_property', methods=['POST'])
def add_property(name=None):
    pass
    # form = AddPropertyForm()
    # if form.validate_on_submit():
    #     layer = Layer.by_name(name)
    #     try:
    #         layer.add_property({
    #             'name': form.data['name'],
    #             'title': form.data['title']
    #         })
    #     except ValueError:
    #         flash(_('Property %(name)s already exists' % (
    #             {'name': form.data['name']})), 'error')
    #     else:
    #         db.session.commit()
    #         flash(_('Property %(name)s added', name=form.data['name']),
    #               'success')
    # else:
    #     for field_name, errors in form.errors.items():
    #         for error in errors:
    #             flash(form[field_name].label.text + ': ' + error, 'error')
    #
    # return redirect(url_for('.properties', name=name))


@digitize.route('/admin/<name>/remove_property/<key>', methods=['GET'])
def remove_property(name=None, key=None):
    pass
    # layer = Layer.by_name(name)
    # if key is None:
    #     abort(404)
    #
    # schema = layer.properties_schema
    # if key not in schema['properties']:
    #     abort(404)
    #
    # del schema['properties'][key]
    #
    # layer.properties_schema = schema
    # db.session.commit()
    #
    # for group in layer.feature_groups:
    #     for feature in group.features:
    #         if feature.properties.get(key):
    #             del feature.properties[key]
    # db.session.commit()
    #
    # flash(_('Property %(key)s removed', key=key), 'success')
    # return redirect(url_for('.properties', name=name))


def combine_date_and_time(_date, _time, default_time=[0, 0]):
    if _date is None:
        return None
    if _time is None:
        _time = time(default_time[0], default_time[1])
    else:
        _time = _time.time()
    _date = datetime.combine(_date, _time)

    return _date


def validate_dates(form, start_date, end_date):
    if start_date is None and end_date is None:
        return True

    valid = True
    if start_date is not None and end_date is None:
        form.end_date.errors.append(
            _('Can not be empty if start date is set'))
        valid = False

    if end_date is not None and start_date is None:
        form.start_date.errors.append(
            _('Can not be empty if end date is set'))
        valid = False

    if valid:
        if start_date >= end_date:
            form.start_date.errors.append(
                _('start date must be lower than end date'))
            valid = False

        if end_date <= start_date:
            form.end_date.errors.append(
                _('end date must be greater than start date'))
            valid = False

    return valid


@digitize.context_processor
def digitize_context_processor():
    # TODO check if still needed
    def is_admin():
        return check_group_permission([
            current_app.config.get('DIGITIZE_ADMIN_GROUP')
        ])

    return dict(is_admin=is_admin)


@digitize.route('/group/<int:id>', methods=['GET'])
def group(id):
    pass
    # group = FeatureGroup.by_id(id)
    # return jsonify(group.resless_feature_collection)


@digitize.route('/group/<int:id>', methods=['DELETE'])
def remove_feature_group(id):
    pass
    # group = FeatureGroup.by_id(id)
    # db.session.delete(group)
    # db.session.commit()
    # return jsonify({
    #     'action': 'removed',
    #     'message': _('Removed feature group successfully'),
    # })


@digitize.route('/features', methods=['POST'])
def features():
    pass
    # if LocalProxyRequest.json is None:
    #     abort(400)
    #
    # # got group_id from name, because group_id is assigned as name
    # # see 'digitizer' below
    # group_id = LocalProxyRequest.json.get('name')
    # feature_collection = LocalProxyRequest.json.get('featureCollection')
    #
    # if None in (group_id, feature_collection):
    #     abort(400)
    #
    # group = FeatureGroup.by_id(group_id)
    #
    # # TODO: Should all features be really deleted before creating? Why not adding only the new feature?
    # # In case of error, all features will be deleted and none will be written.
    # # Maybe refactor this
    # group.delete_all_features()
    #
    # features = feature_collection.get('features', [])
    #
    # for feature in features:
    #     feature = Feature(feature_group=group, geojson=feature)
    #     db.session.add(feature)
    # db.session.commit()
    #
    # response = jsonify({
    #     'action': 'created',
    #     'message': _('%(title)s saved successfully', title=group.title),
    # })
    # response.status_code = 200
    # return response


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
    pass
    # layer = Layer.by_name(name)
    # app_config = load_app_config('digitize')
    # layers_def = prepare_layers_def(app_config, current_app.layers)
    # draw_layers = []
    # for group in layer.feature_groups:
    #     draw_layers.append({
    #         'title': group.title,
    #         # assigned group id to name, because anol layer needs a name
    #         # to handle layer things internaly correct
    #         'name': group.id,
    #         'active': group.active,
    #         'properties_schema': layer.properties_schema,
    #         'properties_schema_form_options': layer.properties_schema_form_options,
    #         'style': layer.style,
    #         'style_schema': layer.style_schema,
    #         'style_schema_form_options': layer.style_schema_form_options,
    #         'label_schema': layer.label_schema,
    #         'label_schema_form_options': layer.label_schema_form_options,
    #         'url': url_for('digitize.group', id=group.id)
    #     })
    # return render_template('digitize/app/index.html', draw_layers=draw_layers,
    #                        layers_def=layers_def,
    #                        app_config=app_config,
    #                        available_icons=list_available_icons())


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
