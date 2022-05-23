from datetime import datetime, time

from flask import (
    Blueprint, request, jsonify, abort, url_for,
    render_template, redirect, flash, current_app
)

from flask_login import current_user

from munimap.extensions import db
from munimap.helper import _, check_group_permission, merge_dict

from munimap_digitize.model import Layer, FeatureGroup
from munimap_digitize.forms.admin import (
    EditPropertiesForm, AddPropertyForm, StyleForm, GroupForm,
    LayerForm
)


digitize_admin = Blueprint(
    'digitize_admin',
    __name__,
    template_folder='../templates',
    static_folder='../static',
    static_url_path='/static',
    url_prefix='/digitize'
)


@digitize_admin.before_request
def check_permission():
    access_allowed = check_group_permission(
        [current_app.config.get('DIGITIZE_ADMIN_PERMISSION')]
    )
    if current_user.is_anonymous:
        flash(_('You are not allowed to administrate the digitize layers'),
              'error')
        return redirect(url_for('user.login', next=request.url))
    if not access_allowed:
        if request.is_json: # is_xhr is deprectaed
            return jsonify(message='Not allowed')
        return abort(403)


@digitize_admin.route('/admin')
@digitize_admin.route('/admin/<name>')
def admin(name=None):
    layers = Layer.query.all()
    return render_template('digitize/admin/index.html', layers=layers, name=name)


@digitize_admin.route('/admin/toggle_group/<id>')
def toggle_group(id=None):
    group = FeatureGroup.by_id(id)
    group.active = not group.active
    db.session.commit()
    data = {
        'group': group.title,
        'status': _('activated') if group.active else _('deactivated')
    }
    flash(_('Group %(group)s %(status)s',
            group=data['group'], status=data['status']),
          'success')

    return redirect(url_for('digitize_admin.admin', name=group.layer.name))


@digitize_admin.route('/admin/<name>/properties', methods=['GET'])
def properties(name=None):
    layer = Layer.by_name(name)

    edit_form = EditPropertiesForm.from_schema(layer.properties_schema)
    add_form = AddPropertyForm()

    return render_template('digitize/admin/properties.html',
                           property_keys=list(layer.properties_schema['properties'].keys()),
                           edit_form=edit_form,
                           add_form=add_form,
                           layer=layer,
                           name=name)


@digitize_admin.route('/admin/<name>/edit_properties', methods=['POST'])
def edit_properties(name=None):
    layer = Layer.by_name(name)

    form = EditPropertiesForm.from_schema(layer.properties_schema)

    if form.validate_on_submit():
        schema = layer.properties_schema
        for key in list(schema['properties'].keys()):
            schema['properties'][key]['title'] = form.data[key]
        layer.properties_schema = schema
        db.session.commit()
        flash(_('Property updated'), 'success')
    else:
        for field_name, errors in list(form.errors.items()):
            for error in errors:
                flash(field_name + ': ' + error, 'error')

    return redirect(url_for('.properties', name=name))


@digitize_admin.route('/admin/<name>/add_property', methods=['POST'])
def add_property(name=None):
    form = AddPropertyForm()
    if form.validate_on_submit():
        layer = Layer.by_name(name)
        try:
            layer.add_property({
                'name': form.data['name'],
                'title': form.data['title']
            })
        except ValueError:
            flash(_('Property %(name)s already exists' % (
                {'name': form.data['name']})), 'error')
        else:
            db.session.commit()
            flash(_('Property %(name)s added', name=form.data['name']),
                  'success')
    else:
        for field_name, errors in list(form.errors.items()):
            for error in errors:
                flash(form[field_name].label.text + ': ' + error, 'error')

    return redirect(url_for('.properties', name=name))


@digitize_admin.route('/admin/<name>/remove_property/<key>', methods=['GET'])
def remove_property(name=None, key=None):
    layer = Layer.by_name(name)
    if key is None:
        abort(404)

    schema = layer.properties_schema
    if key not in schema['properties']:
        abort(404)

    del schema['properties'][key]

    layer.properties_schema = schema
    db.session.commit()

    for group in layer.feature_groups:
        for feature in group.features:
            if feature.properties.get(key):
                del feature.properties[key]
    db.session.commit()

    flash(_('Property %(key)s removed', key=key), 'success')
    return redirect(url_for('.properties', name=name))


@digitize_admin.route('/admin/<name>/edit_style', methods=['GET', 'POST'])
def edit_style(name=None):
    layer = Layer.by_name(name)
    style = layer.style

    schema = merge_dict(layer.style_schema.copy(), layer.label_schema.copy())

    # rearange form fields
    style_schema_form_options = list(layer.style_schema_form_options)
    submit_button = style_schema_form_options.pop()
    label_schema_form_options = list(layer.label_schema_form_options)
    del label_schema_form_options[0]
    form_options = style_schema_form_options + label_schema_form_options
    form_options.append(submit_button)

    form = StyleForm()
    if form.validate_on_submit():
        for key, value in list(form.data.items()):
            style[key] = value
            if value is not 0 and not value:
                try:
                    del style[key]
                except KeyError:
                    pass
        layer.style = style
        db.session.commit()
        flash(_('Style updated'), 'success')
        return redirect(url_for('digitize_admin.admin', name=name))

    return render_template('digitize/admin/style.html', form=form, layer=layer,
                           schema=schema,
                           form_options=form_options,
                           name=name)


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


@digitize_admin.route('/admin/<name>/add_group', methods=['GET', 'POST'])
def add_group(name=None):
    layer = Layer.by_name(name)
    form = GroupForm()
    if form.validate_on_submit():
        group = FeatureGroup(title=form.data['title'])
        group.min_scale = form.data['min_scale']
        group.max_scale = form.data['max_scale']

        start_date = combine_date_and_time(
            form.data['start_date'], form.data['start_time'])
        end_date = combine_date_and_time(
            form.data['end_date'], form.data['end_time'],
            default_time=[23, 59])

        if validate_dates(form, start_date, end_date):
            group.start_date = start_date
            group.end_date = end_date

            if group.has_daterange:
                group.active = False
            group.layer = layer

            db.session.add(group)
            db.session.commit()
            flash(_('Group %(name)s added', name=group.title), 'success')
            return redirect(url_for('digitize_admin.admin', name=name))

    if form.start_time.data is None:
        form.start_time.data = ''
    if form.end_time.data is None:
        form.end_time.data = ''

    return render_template('digitize/admin/group.html', form=form, layer=layer,
                           name=layer.name)


@digitize_admin.route('/admin/<name>/group/<int:id>', methods=['GET', 'POST'])
def edit_group(name=None, id=None):
    layer = Layer.by_name(name)
    group = FeatureGroup.by_id(id)
    form = GroupForm(obj=group)
    if form.validate_on_submit():
        group.title = form.data['title']
        group.min_scale = form.data['min_scale']
        group.max_scale = form.data['max_scale']

        start_date = combine_date_and_time(
            form.data['start_date'], form.data['start_time'])
        end_date = combine_date_and_time(
            form.data['end_date'], form.data['end_time'],
            default_time=[23, 59])

        if validate_dates(form, start_date, end_date):
            group.start_date = start_date
            group.end_date = end_date

            if group.has_daterange:
                group.active = False
            db.session.commit()
            flash(_('Group %(name)s updated', name=group.title), 'success')

    if group.start_date is not None:
        form.start_time.data = group.start_date.strftime('%H:%M')
    else:
        form.start_time.data = ''

    if group.end_date is not None:
        form.end_time.data = group.end_date.strftime('%H:%M')
    else:
        form.end_time.data = ''

    return render_template('digitize/admin/edit_group.html', form=form,
                           name=name, layer=layer)


@digitize_admin.route('/admin/remove_group/<int:id>')
def remove_group(id=None):
    group = FeatureGroup.by_id(id)
    group_title = group.title
    layer_name = group.layer.name
    db.session.delete(group)
    db.session.commit()
    flash(_('Group %(name)s removed', name=group_title), 'success')
    return redirect(url_for('digitize_admin.admin', name=layer_name))


@digitize_admin.route('/admin/add_layer', methods=['GET', 'POST'])
def add_layer():
    form = LayerForm()
    if form.validate_on_submit():
        layer = Layer(name=form.data['name'], title=form.data['title'])
        db.session.add(layer)
        db.session.commit()
        flash(_('Layer %(name)s added', name=layer.name), 'success')
        return redirect(url_for('digitize_admin.admin', name=layer.name))
    return render_template('digitize/admin/layer.html', form=form, name=None)


@digitize_admin.route('/admin/edit_layer/<name>', methods=['GET', 'POST'])
def edit_layer(name):
    layer = Layer.by_name(name)
    form = LayerForm(obj=layer)
    if form.validate_on_submit():
        layer.title = form.data['title']
        layer.name = form.data['name']
        db.session.commit()
        flash(_('Layer %(name)s updated', name=layer.name), 'success')
        return redirect(url_for('digitize_admin.admin', name=layer.name))
    return render_template('digitize/admin/edit_layer.html', form=form,
                           name=name)


@digitize_admin.route('/admin/remove_layer/<name>')
def remove_layer(name=None):
    layer = Layer.by_name(name)
    db.session.delete(layer)
    db.session.commit()
    flash(_('Layer %(name)s removed', name=name), 'success')
    return redirect(url_for('digitize_admin.admin'))
