

import os

import yaml
import shutil
import datetime
from sqlalchemy import func

from flask import (
    Blueprint,
    render_template,
    current_app,
    Request,
    jsonify,
    flash,
    redirect,
    abort,
    send_from_directory,
    url_for,
    request as LocalProxyRequest
)

from flask_login import current_user

from munimap.extensions import db
from munimap.helper import (
    _,
    list_projects,
    check_group_permission,
    config_file_path,
    project_file_path,
    touch_last_changes_file,
    list_selectionlists,
    selectionlist_file_path,
    list_plugins,
    plugin_file_path
)

from munimap.transfer import transfer_config
from munimap.layers import check_project_config, check_project_config_only
from munimap.forms.admin import (
    MBGroupForm,
    ProjectForm,
    NewProjectForm,
    EditUserForm,
    NewUserForm,
    SelectionlistForm,
    NewSelectionlistForm,
    PluginForm,
    NewPluginForm
)
from munimap.model import MBUser, MBGroup, ProtectedLayer, ProtectedProject

admin = Blueprint('admin', __name__, url_prefix='/admin')


@admin.before_request
def check_permission():
    if current_user.is_anonymous:
        flash(_('You are not allowed to administrate the app'),
              'error')
        return redirect(url_for('user.login', next=LocalProxyRequest.url))
    access_allowed = check_group_permission(
        current_app.config.get('ADMIN_GROUPS')
    )
    if not access_allowed:
        if LocalProxyRequest.is_xhr:
            return jsonify(message='Not allowed')
        return abort(403)


@admin.route('/')
@admin.route('/<path:path>')
def index(path=None):
    layers = []
    for name, layer in list(current_app.layers.items()):
        _layer = {
            'name': name,
            'title': layer['title'],
            'type': layer['type'],
            'status': layer['status'] if 'status' in layer else 'active',
        }
        if 'url' in layer['source']:
            _layer['url'] = layer['source']['url']
        if 'format' in layer['source']:
            _layer['format'] = layer['source']['format']
        if 'layer' in layer['source']:
            _layer['layers'] = [layer['source']['layer']]
        elif 'layers' in layer['source']:
            _layer['layers'] = layer['source']['layers']

        layers.append(_layer)

    protected_layers = {}
    for layer in [l.to_dict(list(current_app.layers.keys())) for l in ProtectedLayer.query.all()]:
        protected_layers[layer['name']] = layer

    projects = list_projects()
    protected_projects = {}
    for project in [p.to_dict(projects) for p in ProtectedProject.query.all()]:
        protected_projects[project['name']] = project

    selectionlists = list_selectionlists()

    plugins = list_plugins()

    groups = [g.to_dict() for g in MBGroup.query.all()]
    users = [u.to_dict() for u in MBUser.query.all()]

    group_form = MBGroupForm()

    map_configs = current_app.layers_list

    enviroment = 'production'
    if current_app.config.get('API_PRODUCTION_URL'):
        enviroment = 'test'

    logs = []
    alkis_log_folder = os.path.join(
        current_app.root_path,
        current_app.config['ALKIS_LOG_DIR'],
    )
    for (dirpath, dirnames, filenames) in os.walk(alkis_log_folder):
        for filename in filenames:
            if filename.endswith('.csv'):
                logs.append(filename)

    logs.sort()
    return render_template('munimap/admin/index.html',
        layers=layers,
        map_configs=map_configs,
        protected_layers=protected_layers,
        projects=projects,
        protected_projects=protected_projects,
        groups=groups,
        users=users,
        group_form=group_form,
        logs=logs,
        enviroment=enviroment,
        selectionlists=selectionlists,
        plugins=plugins
    )


#
# forms endpoints
#
@admin.route('/groups/add', methods=['POST'])
def add_group():
    form = MBGroupForm(LocalProxyRequest.form)

    if form.validate_on_submit():
        group = MBGroup()
        group.name = form.name.data
        group.title = form.title.data
        group.description = form.description.data
        db.session.add(group)
        db.session.commit()

        return jsonify({
            'group': group.to_dict(),
            'message': _('Group %(name)s created', name=group.name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/groups/edit', methods=['POST'])
def edit_group():
    group_id = LocalProxyRequest.form.get('id', None)

    group = MBGroup.by_id_without_404(group_id)

    if group is None:
        response = jsonify({
            'code': 404,
            'message': _('Group not exists')
        })
        response.status_code = 404
        return response

    form = MBGroupForm(LocalProxyRequest.form)
    if form.validate_on_submit():
        group.name = form.name.data
        group.title = form.title.data
        group.description = form.description.data
        db.session.commit()
        return jsonify({
            'group': group.to_dict(),
            'message': _('Group %(name)s updated', name=group.name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


#
# angular api endpoints
#
@admin.route('/users/load', methods=['POST'])
def load_user():
    r = LocalProxyRequest.json
    user = MBUser.by_id_without_404(r['userId'])
    user_details = user.to_mb_dict()
    if LocalProxyRequest.args.get('duplicate'):
        del user_details['mb_user_email']
        del user_details['mb_user_name']
        del user_details['mb_user_firstname']
        del user_details['mb_user_lastname']

    return jsonify({
        'user': user_details,
        'message': _('user %(name)s load', name=user.mb_user_name)

    })


@admin.route('/users/remove', methods=['POST'])
def remove_user():
    r = LocalProxyRequest.json
    user = MBUser.by_id_without_404(r['userId'])
    if user == current_user:
        return jsonify({
            'message': _('own user cannot be removed'),
            'code': 400
        })
    if user is None:
        return jsonify({
            'user': {
                'id': r['userId']
            },
            'message': _('user removed')
        })

    db.session.delete(user)
    db.session.commit()
    return jsonify({
        'user': user.to_dict(),
        'message': _('user %(name)s removed', name=user.mb_user_name)
    })


def update_user_parameters(user, data):
    user.mb_user_description = data['mb_user_description']
    user.mb_user_email = data['mb_user_email']
    user.mb_user_phone = data['mb_user_phone']
    user.mb_user_department = data['mb_user_department']
    user.mb_user_organisation_name = data['mb_user_organisation_name']
    user.mb_user_position_name = data['mb_user_position_name']
    user.mb_user_facsimile = data['mb_user_facsimile']
    user.mb_user_delivery_point = data['mb_user_delivery_point']
    user.mb_user_city = data['mb_user_city']
    user.mb_user_country = data['mb_user_country']
    user.mb_user_street = data['mb_user_street']
    user.mb_user_housenumber = data['mb_user_housenumber']
    user.mb_user_firstname = data['mb_user_firstname']
    user.mb_user_lastname = data['mb_user_lastname']
    user.mb_user_academictitle = data['mb_user_academictitle']
    user.mb_user_dienstkey = data['mb_user_dienstkey']
    user.mb_user_active = data['mb_user_active']
    user.mb_user_idm_managed = data['mb_user_idm_managed']

    if data.get('mb_user_postal_code'):
       user.mb_user_postal_code = data['mb_user_postal_code']

    if data.get('mb_user_valid_to'):
        user.mb_user_valid_to = data.get('mb_user_valid_to')
    else:
        user.mb_user_valid_to = None

    if data.get('mb_user_login_count'):
        user.mb_user_login_count = data['mb_user_login_count']
    else:
        user.mb_user_login_count = 0
    return user


@admin.route('/users/edit', methods=['POST'])
def edit_user():
    form = EditUserForm(LocalProxyRequest.form, meta={'csrf': False})
    if form.validate_on_submit():
        data = form.data
        user = MBUser.by_id_without_404(data['mb_user_id'])
        errors = {}
        if data['mb_user_name'] != user.name:
            user_exist = MBUser.query.filter(
                func.lower(MBUser.mb_user_name) == func.lower(data['mb_user_name'])
            ).first()
            if not user_exist:
                user.mb_user_name = form.mb_user_name.data
            else:
                errors['mb_user_name'] = [_('Username %(name)s already exists', name=form.mb_user_name.data)]

        if errors:
            return jsonify({
                    'errors': errors,
                    'success': False,
                    'message': _('Invalid form'),
                    'code': 400
                })

        if form.data['mb_user_password']:
            user.update_password(form.data['mb_user_password'])
        user = update_user_parameters(user, data)
        db.session.commit()

        return jsonify({
            'user': user.to_dict(),
            'success': True,
            'message': _('User %(name)s updated', name=user.name)
        })

    response = jsonify({
        'errors': form.errors,
        'success': False,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/users/add', methods=['POST'])
def add_user():
    form = NewUserForm(LocalProxyRequest.form, meta={'csrf':False})

    duplicate = LocalProxyRequest.args.get('duplicate', False)

    if form.validate_on_submit():
        data = form.data
        user = MBUser()
        user.mb_user_name = data['mb_user_name']
        user.update_password(data['mb_user_password'])
        user.mb_user_valid_from = datetime.datetime.now()
        user.mb_user_owner = current_user.mb_user_id
        user = update_user_parameters(user, data)
        db.session.add(user)
        db.session.commit()

        if duplicate:
            base_user = MBUser.by_id_without_404(data['mb_user_id'])
            for group in base_user.groups:
                group.users.append(user)
            db.session.commit()

        return jsonify({
            'user': user.to_dict(),
            'success': True,
            'message': _('User %(name)s created', name=user.name)
        })

    response = jsonify({
        'errors': form.errors,
        'success': False,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/groups/remove', methods=['POST'])
def remove_group():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])

    if group is None:
        return jsonify({
            'group': {
                'id': r['groupId']
            },
            'message': _('group removed')
        })

    db.session.delete(group)
    db.session.commit()
    return jsonify({
        'group': group.to_dict(),
        'message': _('group %(name)s removed', name=group.name)
    })


@admin.route('/groups/user/add', methods=['POST'])
def group_add_user():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])
    user = MBUser.by_id_without_404(r['userId'])

    if None in [group, user]:
        response = jsonify({'code': 404, 'message': _('User or group does not exist')})
        response.status_code = 404
        return response

    if user in group.users:
        jsonify({
            'groupId': group.id,
            'userId': user.id,
            'message': _('"%(user_name)s" added to "%(group_name)s"',
                         user_name=user.name, group_name=group.name)
        })

    group.users.append(user)
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'userId': user.id,
        'message': _('"%(user_name)s" added to "%(group_name)s"',
                     user_name=user.name, group_name=group.name)
    })


@admin.route('/groups/user/remove', methods=['POST'])
def group_remove_user():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])
    user = MBUser.by_id_without_404(r['userId'])

    if None in [group, user]:
        response = jsonify({'code': 404, 'message': _('User or group does not exist')})
        response.status_code = 404
        return response

    if user not in group.users:
        return jsonify({
            'groupId': group.id,
            'userId': user.id,
            'message': _('"%(user_name)s" removed from "%(group_name)s"',
                         user_name=user.name, group_name=group.name)
        })

    group.users.pop(group.users.index(user))
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'userId': user.id,
        'message': _('"%(user_name)s" removed from "%(group_name)s"',
                     user_name=user.name, group_name=group.name)
    })


@admin.route('/groups/layer/add', methods=['POST'])
def group_add_layer():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])
    layer = ProtectedLayer.by_name_without_404(r['layerName'])

    if None in [group, layer]:
        response = jsonify({'code': 404, 'message': _('Layer or group does not exist')})
        response.status_code = 404
        return response

    if layer in group.layers:
        return jsonify({
            'groupId': group.id,
            'layerName': layer.name,
            'message': _('"%(layer_name)s added to "%(group_name)s"',
                         layer_name=layer.name, group_name=group.name)
        })

    group.layers.append(layer)
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'layerName': layer.name,
        'message': _('"%(layer_name)s added to "%(group_name)s"',
                     layer_name=layer.name, group_name=group.name)
    })


@admin.route('/groups/layer/remove', methods=['POST'])
def group_remove_layer():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])
    layer = ProtectedLayer.by_name_without_404(r['layerName'])

    if None in [group, layer]:
        response = jsonify({'code': 404, 'message': _('Layer or group does not exist')})
        response.status_code = 404
        return response

    if layer not in group.layers:
        return jsonify({
            'groupId': group.id,
            'layerName': layer.name,
            'message': _('"%(layer_name)s removed from "%(group_name)s"',
                         layer_name=layer.name, group_name=group.name)
        })

    group.layers.pop(group.layers.index(layer))
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'layerName': layer.name,
        'message': _('"%(layer_name)s removed from "%(group_name)s"',
                     layer_name=layer.name, group_name=group.name)
    })


@admin.route('/groups/project/add', methods=['POST'])
def group_add_project():
    r = LocalProxyRequest.json
    group = MBGroup.by_id_without_404(r['groupId'])
    project = ProtectedProject.by_name_without_404(r['projectName'])

    if None in [group, project]:
        response = jsonify({'code': 404, 'message': _('Project or group does not exist')})
        response.status_code = 404
        return response

    if project in group.projects:
        return jsonify({
            'groupId': group.id,
            'projectName': project.name,
            'message': _('"%(project_name)s" added to "%(group_name)s"',
                         project_name=project.name, group_name=group.name)
        })

    group.projects.append(project)
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'projectName': project.name,
        'message': _('"%(project_name)s" added to "%(group_name)s"',
                     project_name=project.name, group_name=group.name)
    })


@admin.route('/groups/project/remove', methods=['POST'])
def group_remove_project():
    r = LocalProxyRequest.json

    group = MBGroup.by_id_without_404(r['groupId'])
    project = ProtectedProject.by_name_without_404(r['projectName'])

    if None in [group, project]:
        response = jsonify({'code': 404, 'message': _('Project or group does not exist')})
        response.status_code = 404
        return response

    if project not in group.projects:
        return jsonify({
            'groupId': group.id,
            'projectName': project.name,
            'message': _('"%(project_name)s" removed from "%(group_name)s"',
                         project_name=project.name, group_name=group.name)
        })

    group.projects.pop(group.projects.index(project))
    db.session.commit()
    return jsonify({
        'groupId': group.id,
        'projectName': project.name,
        'message': _('"%(project_name)s" removed from "%(group_name)s"',
                     project_name=project.name, group_name=group.name)
    })


@admin.route('/projects/protect', methods=['POST'])
def protect_project():
    r = LocalProxyRequest.json
    project = ProtectedProject.by_name_without_404(r['projectName'])

    if project is not None:
        return jsonify({
            'project': project.to_dict(list_projects()),
            'message': _('Project "%(project)s protected', project=project.name)
        })

    project = ProtectedProject()
    project.name = r['projectName']
    db.session.add(project)
    db.session.commit()
    return jsonify({
        'project': project.to_dict(list_projects()),
        'message': _('Project "%(project)s protected', project=project.name)
    })


@admin.route('/projects/unprotect', methods=['POST'])
def unprotect_project():
    r = LocalProxyRequest.json
    project = ProtectedProject.by_id_without_404(r['projectId'])

    if project is None:
        return jsonify({
            'project': {
                'id': r['projectId']
            },
            'message': _('Project "%(project)s unprotected', project=project.name)
        })

    db.session.delete(project)
    db.session.commit()
    return jsonify({
        'project': project.to_dict(list_projects()),
        'message': _('Project "%(project)s unprotected', project=project.name)
    })


@admin.route('/layers/load', methods=['GET'])
def load_layers():
    layers = []
    for name, layer in list(current_app.layers.items()):
        _layer = {
            'name': name,
            'title': layer['title'],
            'type': layer['type'],
            'status': layer['status'] if 'status' in layer else 'active',
        }
        if 'url' in layer['source']:
            _layer['url'] = layer['source']['url']
        if 'format' in layer['source']:
            _layer['format'] = layer['source']['format']
        if 'layer' in layer['source']:
            _layer['layers'] = [layer['source']['layer']]
        elif 'layers' in layer['source']:
            _layer['layers'] = layer['source']['layers']

        layers.append(_layer)

    protected_layers = {}
    for layer in [l.to_dict(list(current_app.layers.keys())) for l in ProtectedLayer.query.all()]:
        protected_layers[layer['name']] = layer

    return jsonify({
        'layers': layers,
        'protected_layers': protected_layers
    })


@admin.route('/layers/protect', methods=['POST'])
def protect_layer():
    r = LocalProxyRequest.json
    layer = ProtectedLayer.by_name_without_404(r['layerName'])

    if layer is not None:
        return jsonify({
            'layer': layer.to_dict(list(current_app.layers.keys())),
            'message': _('layer "%(layer)s protected', layer=layer.name)
        })

    layer = ProtectedLayer()
    layer.name = r['layerName']
    layer.title = r['layerTitle']
    db.session.add(layer)
    db.session.commit()
    touch_last_changes_file()
    return jsonify({
        'layer': layer.to_dict(list(current_app.layers.keys())),
        'message': _('layer "%(layer)s protected', layer=layer.name)
    })


@admin.route('/layers/unprotect', methods=['POST'])
def unprotect_layer():
    r = LocalProxyRequest.json
    layer = ProtectedLayer.by_id_without_404(r['layerId'])

    if layer is None:
        return jsonify({
            'layer': {
                'id': r['layerId']
            },
            'message': _('layer "%(layer)s unprotected', layer=layer.name)
        })

    db.session.delete(layer)
    db.session.commit()
    touch_last_changes_file()
    return jsonify({
        'layer': layer.to_dict(list(current_app.layers.keys())),
        'message': _('layer "%(layer)s unprotected', layer=layer.name)
    })


@admin.route('/projects/load', methods=['POST'])
def load_project():
    name = LocalProxyRequest.form.get('name', False)
    config_file = project_file_path(name)

    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Project do not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    app_code = open(config_file, 'r').read()

    return jsonify({
        'code': app_code,
        'message': _('project "%(name)s loaded', name=name)
    })


@admin.route('/projects/add', methods=['POST'])
def add_project():
    form = NewProjectForm(LocalProxyRequest.form, meta={'csrf': False})

    if form.validate_on_submit():
        # check if input is valid yaml
        try:
            yaml.safe_load(form.code.data)
        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        name = LocalProxyRequest.form.get('new')
        config_file = project_file_path(name)

        if os.path.exists(config_file):
            response = jsonify({
                'message': _('Project with name "%(name)s" already exists', name=name),
                'code': 400
                })
            response.status_code = 400
            return response

        with open(config_file, 'w+') as yaml_file:
            yaml_file.write(form.code.data)

        return jsonify({
            'project': name,
            'success': True,
            'message': _('Project %(name)s created', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/projects/edit', methods=['POST'])
def edit_project():
    name = LocalProxyRequest.form.get('name')

    if name is None:
        response = jsonify({
            'code': 404,
            'message': _('Project not exists')
        })
        response.status_code = 404
        return response

    form = ProjectForm(LocalProxyRequest.form, meta={'csrf': False})
    if form.validate_on_submit():
        config_file = project_file_path(name)
        if not os.path.exists(config_file):
            response = jsonify({
                'message': _('Project does not exist'),
                'code': 400
                })
            response.status_code = 400
            return response

        try:
            yaml.safe_load(form.code.data)
        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w') as yaml_file:
            yaml_file.write(form.code.data)

        return jsonify({
            'project': name,
            'success': True,
            'message': _('Project %(name)s updated', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/projects/rename', methods=['POST'])
def rename_project_config():
    name = '%s' % LocalProxyRequest.form.get('name')
    new_name = '%s' % LocalProxyRequest.form.get('newName')
    if name is None or new_name is None:
        response = jsonify({
            'code': 404,
            'message': _('Project config does not exist')
        })
        response.status_code = 404
        return response

    config_file = project_file_path(name)
    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Project config does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    config_file_new = project_file_path(new_name)
    if os.path.exists(config_file_new):
        response = jsonify({
            'message': _('Project config already exists'),
            'code': 400
        })
        response.status_code = 400
        return response

    project = ProtectedProject.by_name_without_404(name)
    project_dict = None
    if project is not None:
        project.name = new_name
        db.session.commit()
        project_dict = project.to_dict(list_projects())

    shutil.move(config_file, config_file_new)

    return jsonify({
        'success': True,
        'name': name,
        'newName': new_name,
        'project': project_dict,
        'message': _('Project %(name)s renamed to %(new_name)s', name=name, new_name=new_name)
    })


@admin.route('/projects/remove', methods=['POST'])
def remove_project():
    name = LocalProxyRequest.form.get('name')
    if name:
        config_file = project_file_path(name)
        if os.path.exists(config_file):
            os.remove(config_file)

        # delete from protected projects
        project = ProtectedProject.by_name_without_404(name)
        if project:
            db.session.delete(project)
            db.session.commit()

        return jsonify({
            'success': True,
            'project': name,
            'message': _('Project %(name)s removed', name=name)
        })

    return jsonify({
        'success': True,
        'message': _('Project %(name)s not found', name=name)
    })


@admin.route('/projects/transfer', methods=['POST'])
def transfer_project_config():
    r = LocalProxyRequest.json
    name = r.get('projectName', False)
    if name:
        config_file = project_file_path(name)
        if os.path.exists(config_file):
            transfer_config(config_file, type_='project')

            return jsonify({
                'success': True,
                'message': _('Project %(name)s was transferred', name=name)
            })

    if not name:
        return jsonify({
            'success': False,
            'message': _('No project selected')
        })

    return jsonify({
        'success': False,
        'message': _('Project %(name)s not found', name=name)
    })


@admin.route('/map/config/load', methods=['POST'])
def load_map_config():
    name = LocalProxyRequest.form.get('name', False)
    config_file = config_file_path(name)

    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Map config does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    app_code = open(config_file, 'r').read()
    return jsonify({
        'code': app_code,
        'message': _('Map config "%(name)s loaded', name=name)
    })


@admin.route('/map/config/add', methods=['POST'])
def add_map_config():
    form = NewProjectForm(LocalProxyRequest.form, meta={'csrf': False})

    if form.validate_on_submit():
        filename = LocalProxyRequest.form.get('new')
        name = filename + '.yaml'

        try:
            new_yaml_content = yaml.safe_load(form.code.data)
            if new_yaml_content:
                local_errors, local_informal_only = check_project_config_only(new_yaml_content)
                global_errors, global_informal_only = check_project_config(new_yaml_content, exclude_file=name)
                # subtract local errors from global errors to show them different on web
                errors = [item for item in local_errors if item in global_errors]
                admin_save = LocalProxyRequest.form.get('adminSave', False)

                overwrite = False
                if admin_save and global_informal_only and local_informal_only:
                    overwrite = True

                if (local_errors or global_errors) and not overwrite:
                    response = jsonify({
                        'errors': errors,
                        'local_errors': local_errors,
                        'informal_only': global_informal_only,
                        'message': _('Config has some errors'),
                        'code': 400
                    })
                    response.status_code = 400
                    return response

        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        config_file = config_file_path(name)
        if os.path.exists(config_file):
            response = jsonify({
                'message': _('Map config already exists'),
                'code': 400
                })
            response.status_code = 400
            return response

        with open(config_file, 'w+') as yaml_file:
            yaml_file.write(form.code.data)

        touch_last_changes_file()

        # load new description
        description = ''
        meta = new_yaml_content.get('meta', False)
        if meta and meta.get('description'):
            description = meta.get('description')

        return jsonify({
            'config': {
                'name': name,
                'description': description
            },
            'success': True,
            'message': _('Map config %(name)s created', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/map/config/edit', methods=['POST'])
def edit_map_config():
    name = LocalProxyRequest.form.get('name')

    if name is None:
        response = jsonify({
            'code': 404,
            'message': _('Project does not exist')
        })
        response.status_code = 404
        return response

    form = ProjectForm(LocalProxyRequest.form, meta={'csrf': False})
    if form.validate_on_submit():
        config_file = config_file_path(name)
        if not os.path.exists(config_file):
            response = jsonify({
                'message': _('Map config does not exist'),
                'code': 400
                })
            response.status_code = 400
            return response

        try:
            new_yaml_content = yaml.safe_load(form.code.data)
            local_errors, local_informal_only = check_project_config_only(new_yaml_content)
            global_errors, global_informal_only = check_project_config(new_yaml_content, exclude_file=name)
            # subtract local errors from global errors to show them different on web
            admin_save = LocalProxyRequest.form.get('adminSave', False)

            overwrite = False
            if admin_save and global_informal_only and local_informal_only:
                overwrite = True

            if (local_errors or global_errors) and not overwrite:
                response = jsonify({
                    'errors': global_errors,
                    'local_errors': local_errors,
                    'informal_only': global_informal_only,
                    'message': _('Config has some errors'),
                    'code': 400
                })
                response.status_code = 400
                return response

        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w') as yaml_file:
            yaml_file.write(form.code.data)

        touch_last_changes_file()

        # load new description
        description = ''
        meta = new_yaml_content.get('meta', False)
        if meta and meta.get('description'):
            description = meta.get('description')

        return jsonify({
            'config': {
                'name': name,
                'description': description
            },
            'success': True,
            'message': _('Map config %(name)s updated', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/map/config/remove', methods=['POST'])
def remove_map_config():
    name = LocalProxyRequest.form.get('name')
    if name:
        config_file = config_file_path(name)
        if os.path.exists(config_file):
            os.remove(config_file)

        touch_last_changes_file()

        return jsonify({
            'success': True,
            'config': name,
            'message': _('Map config %(name)s removed', name=name)
        })

    return jsonify({
        'success': True,
        'message': _('Map config %(name)s not found', name=name)
    })


@admin.route('/map/config/rename', methods=['POST'])
def rename_map_config():
    name = LocalProxyRequest.form.get('name')
    new_name = LocalProxyRequest.form.get('newName')
    if name is None or new_name is None:
        response = jsonify({
            'code': 404,
            'message': _('Map config does not exist'),
        })
        response.status_code = 404
        return response

    config_file = config_file_path(name)
    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Map config does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    config_file_new = config_file_path(new_name)
    if os.path.exists(config_file_new):
        response = jsonify({
            'message': _('Map config already exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    shutil.move(config_file, config_file_new)
    touch_last_changes_file()

    return jsonify({
        'success': True,
        'name': name,
        'newName': new_name,
        'message': _('map %(name)s renamed to %(new_name)s', name=name, new_name=new_name)
    })


@admin.route('/map/config/transfer', methods=['POST'])
def transfer_map_config():
    r = LocalProxyRequest.json
    name = r.get('projectName', False)
    if name:
        config_file = config_file_path(name)
        if os.path.exists(config_file):
            transferred = transfer_config(config_file, type_='map')
            if transferred:
                return jsonify({
                    'success': True,
                    'message': _('Map config %(name)s was transferred', name=name)
                })

    if not name:
        return jsonify({
            'success': False,
            'message': _('No project selected')
        })

    return jsonify({
        'success': False,
        'message': _('Project %(name)s not successfully transferred', name=name)
    })


@admin.route('/log/alkis/remove', methods=['POST'])
def remove_alkis_log_config():
    name = LocalProxyRequest.form.get('name')
    if name:
        alkis_log = os.path.join(
            current_app.root_path,
            current_app.config['ALKIS_LOG_DIR'],
            name
        )
        if os.path.exists(alkis_log):
            os.remove(alkis_log)
            return jsonify({
                'success': True,
                'name': name,
                'message': _('alkis.log %(name)s removed', name=name)
            })

    return jsonify({
        'success': False,
        'message': _('alkis.log %(name)s not found', name=name)
    })


@admin.route('/log/alkis/download/')
@admin.route('/log/alkis/download/<filename>')
def download_alkis_log(filename):
    alkis_log_folder = os.path.join(
        current_app.root_path,
        current_app.config['ALKIS_LOG_DIR'],
    )
    return send_from_directory(
        alkis_log_folder,
        filename,
        as_attachment=True, cache_timeout=-1
    )


@admin.route('/selectionlists/load', methods=['POST'])
def load_selectionlist():
    name = LocalProxyRequest.form.get('name', False)
    config_file = selectionlist_file_path(name)

    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Selectionlist does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    app_code = open(config_file, 'r').read()
    return jsonify({
        'code': app_code,
        'message': _('Selectionlist %(name)s loaded', name=name)
    })


@admin.route('/selectionlists/edit', methods=['POST'])
def edit_selectionlist():
    name = LocalProxyRequest.form.get('name')

    if name is None:
        response = jsonify({
            'code': 404,
            'message': _('Selectionlist does not exist')
        })
        response.status_code = 404
        return response

    form = SelectionlistForm(LocalProxyRequest.form, meta={'csrf': False})
    if form.validate_on_submit():
        config_file = selectionlist_file_path(name)
        if not os.path.exists(config_file):
            response = jsonify({
                'message': _('Selectionlist does not exist'),
                'code': 400
            })
            response.status_code = 400
            return response

        try:
            yaml.safe_load(form.code.data)
        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w') as yaml_file:
            yaml_file.write(form.code.data)

        return jsonify({
            'selectionlist': name,
            'success': True,
            'message': _('Selectionlist %(name)s updated', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/selectionlists/add', methods=['POST'])
def add_selectionlist():
    form = NewSelectionlistForm(LocalProxyRequest.form, meta={'csrf': False})

    if form.validate_on_submit():
        # check if input is valid yaml
        try:
            yaml.safe_load(form.code.data)
        except yaml.scanner.ScannerError as ex:
            response = jsonify({
                'errors': str(ex),
                'message': _('Invalid JSON'),
                'code': 400
            })
            response.status_code = 400
            return response

        name = LocalProxyRequest.form.get('new')
        config_file = selectionlist_file_path(name)

        if os.path.exists(config_file):
            response = jsonify({
                'message': _('Selectionlist with name "%(name)s" already exists', name=name),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w+') as yaml_file:
            yaml_file.write(form.code.data)

        return jsonify({
            'selectionlist': name,
            'success': True,
            'message': _('Selectionlist %(name)s created', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/selectionlists/remove', methods=['POST'])
def remove_selectionlist():
    name = LocalProxyRequest.form.get('name')
    if name:
        config_file = selectionlist_file_path(name)
        if os.path.exists(config_file):
            os.remove(config_file)

        return jsonify({
            'success': True,
            'selectionlist': name,
            'message': _('Selectionlist %(name)s removed', name=name)
        })

    return jsonify({
        'success': True,
        'message': _('Selectionlist %(name)s not found', name=name)
    })


@admin.route('/selectionlists/rename', methods=['POST'])
def rename_selectionlist_config():
    name = '%s' % LocalProxyRequest.form.get('name')
    new_name = '%s' % LocalProxyRequest.form.get('newName')
    if name is None or new_name is None:
        response = jsonify({
            'code': 404,
            'message': _('Selectionlist config does not exist')
        })
        response.status_code = 404
        return response

    config_file = selectionlist_file_path(name)
    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Selectionlist config does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    config_file_new = selectionlist_file_path(new_name)
    if os.path.exists(config_file_new):
        response = jsonify({
            'message': _('Selectionlist config already exists'),
            'code': 400
        })
        response.status_code = 400
        return response

    shutil.move(config_file, config_file_new)

    return jsonify({
        'success': True,
        'name': name,
        'newName': new_name,
        'message': _('Selectionlist %(name)s renamed to %(new_name)s', name=name,
                     new_name=new_name)
    })


@admin.route('/plugins/load', methods=['POST'])
def load_plugin():
    name = LocalProxyRequest.form.get('name', False)
    config_file = plugin_file_path(name)

    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Plugin does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    app_code = open(config_file, 'r').read()
    return jsonify({
        'code': app_code,
        'message': _('Plugin %(name)s loaded', name=name)
    })


@admin.route('/plugins/edit', methods=['POST'])
def edit_plugin():
    name = LocalProxyRequest.form.get('name')

    if name is None:
        response = jsonify({
            'code': 404,
            'message': _('Plugin does not exist')
        })
        response.status_code = 404
        return response

    form = PluginForm(LocalProxyRequest.form, meta={'csrf': False})
    if form.validate_on_submit():
        config_file = plugin_file_path(name)
        if not os.path.exists(config_file):
            response = jsonify({
                'message': _('Plugin does not exist'),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w') as file:
            file.write(form.code.data)

        return jsonify({
            'plugin': name,
            'success': True,
            'message': _('Plugin %(name)s updated', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/plugins/add', methods=['POST'])
def add_plugin():
    form = NewPluginForm(LocalProxyRequest.form, meta={'csrf': False})

    if form.validate_on_submit():

        name = LocalProxyRequest.form.get('new')
        config_file = plugin_file_path(name)

        if os.path.exists(config_file):
            response = jsonify({
                'message': _('Plugin with name "%(name)s" already exists', name=name),
                'code': 400
            })
            response.status_code = 400
            return response

        with open(config_file, 'w+') as file:
            file.write(form.code.data)

        return jsonify({
            'plugin': name,
            'success': True,
            'message': _('Plugin %(name)s created', name=name)
        })

    response = jsonify({
        'errors': form.errors,
        'message': _('Invalid form'),
        'code': 400
    })
    response.status_code = 400

    return response


@admin.route('/plugins/remove', methods=['POST'])
def remove_plugin():
    name = LocalProxyRequest.form.get('name')
    if name:
        config_file = plugin_file_path(name)
        if os.path.exists(config_file):
            os.remove(config_file)

        return jsonify({
            'success': True,
            'plugin': name,
            'message': _('Plugin %(name)s removed', name=name)
        })

    return jsonify({
        'success': True,
        'message': _('Plugin %(name)s not found', name=name)
    })


@admin.route('/plugins/rename', methods=['POST'])
def rename_plugin_config():
    name = '%s' % LocalProxyRequest.form.get('name')
    new_name = '%s' % LocalProxyRequest.form.get('newName')
    if name is None or new_name is None:
        response = jsonify({
            'code': 404,
            'message': _('Plugin does not exist')
        })
        response.status_code = 404
        return response

    config_file = plugin_file_path(name)
    if not os.path.exists(config_file):
        response = jsonify({
            'message': _('Plugin does not exist'),
            'code': 400
        })
        response.status_code = 400
        return response

    config_file_new = plugin_file_path(new_name)
    if os.path.exists(config_file_new):
        response = jsonify({
            'message': _('Plugin already exists'),
            'code': 400
        })
        response.status_code = 400
        return response

    shutil.move(config_file, config_file_new)

    return jsonify({
        'success': True,
        'name': name,
        'newName': new_name,
        'message': _('Plugin %(name)s renamed to %(new_name)s', name=name,
                     new_name=new_name)
    })
