
import json
from datetime import timezone, datetime
UTC = timezone.utc  # python3.9

from flask import (
    render_template,
    redirect,
    url_for,
    request,
    current_app,
    jsonify,
    session,
    Response
)

from werkzeug.exceptions import BadRequest, NotFound

from flask_login import login_required, current_user
from flask_babel import gettext as _, to_user_timezone
from munimap.extensions import db

# from munimap.extensions import db
from munimap.model import MBUser, ProtectedProject, ProjectDefaultSettings
from munimap.helper import load_app_config, check_group_permission
from munimap.forms.project_settings import ProjectSettingsForm
from munimap.model import ProjectSettings
from munimap.views.user import user

@user.route("/projects", methods=["GET", "POST"])
@login_required
def projects():
    projects = [(p.name, load_app_config(p.name, without_404=True)) for p in current_user.projects]
    is_admin = check_group_permission(
        current_app.config.get('ADMIN_GROUPS')
    )
    form = ProjectSettingsForm()
    if form.validate_on_submit:
        project_settings = form.settings.data
        project_name = form.name.data

        if form.export_button.data:
            if project_settings:
                resp = export_settings(project_settings)
                return resp 

        if form.load_button.data:
            if project_settings:
                session['project_setting_id'] = project_settings.id

            if project_settings:
                protected_project = ProtectedProject.by_name(project_settings.project)
                default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)
                if not default_settings: 
                    default_settings = ProjectDefaultSettings(
                        project=protected_project,
                        project_settings=project_settings,
                        user=current_user
                    )
                    db.session.add(default_settings)
                else:
                    default_settings.mm_project_settings_id = project_settings.id
                db.session.commit()
            else:
                protected_project = ProtectedProject.by_name(project_name)
                default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)
                if default_settings:
                    db.session.delete(default_settings)
                    db.session.commit()

            return redirect(url_for('munimap.index', config=project_name) )

    project_default_settings = ProjectDefaultSettings.by_user(current_user)
    project_settings = []
    for p_settings in current_user.project_settings:
        selected = False
        for default_settings in project_default_settings:
            if default_settings.mm_project_settings_id == p_settings.id:
                selected = True

        project_settings.append(
            { 
                'id': p_settings.id,
                'name': p_settings.name,
                'project': str(p_settings.project),
                'selected': selected
            }
        )

    selected_default_settings = {}
    for settings in project_default_settings:
        project = ProtectedProject.by_id_without_404(settings.mm_project_id)
        if project:
            name = project.name 
            selected_default_settings[name] = { 
                'defaultProject': str(settings.mm_project_settings_id)
            }

    return render_template(
        'munimap/user/projects.html',
        projects=projects,
        project_settings=project_settings,
        selected_default_settings=selected_default_settings,
        is_admin=is_admin,
        form=form
    )


@user.post("/settings/import")
def import_settings():
    uploaded_file = request.files.get('file')
    project_name = request.form.get('projectName')

    settings_json = {}
    if uploaded_file:
        try:
            settings_json = json.loads(uploaded_file.read())
        except:
             return jsonify({
                'success': False, 
                'message': _('Error project successfully')
            })     


    protected_project = ProtectedProject.by_name(project_name)
    project_settings = None

    name = settings_json['name']

    for settings in current_user.project_settings:
        if settings.project == protected_project.name and settings.name == name:
            project_settings = settings

    if not project_settings:
        project_settings = ProjectSettings(
            name=settings_json['name'],
            project=project_name,
            settings=json.dumps(settings_json),
        )
        current_user.project_settings.append(project_settings)
        db.session.add(project_settings)
    else:
        project_settings.settings = json.dumps(settings_json)
    db.session.commit()

    # save default settings to last imported project
    default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)

    if not default_settings: 
        default_settings = ProjectDefaultSettings(
            project=protected_project,
            project_settings=project_settings,
            user=current_user
        )
        db.session.add(default_settings)
    else:
        default_settings.mm_project_settings_id = project_settings.id
    
    db.session.commit()

    return jsonify({
        'success': True, 
        'message': _('Import project successfully')
    })    


def export_settings(project_settings):
    filename = '%s-%s.json' % (
        project_settings.name,
        to_user_timezone(datetime.now(UTC)).strftime('%Y%m%d-%H%M%S')
    )

    project_settings_json = json.loads(project_settings.settings) 
    resp = Response(
        json.dumps(
            project_settings_json,
            sort_keys=True,
            indent=2,
        ),
        headers={
            'Content-type': 'application/octet-stream',
            'Content-disposition': 'attachment; filename=%s' % filename
        }
    )
    return resp 


@user.post("/settings/save")
@login_required
def save_settings():
    settings_json = request.get_json()
    project_name = settings_json['projectName']
    project = None
    for project_setting in current_user.project_settings:
        if project_setting.name == settings_json['name'] and project_setting.project == project_name:
            project = project_setting

    if not project:
        new_project = True
        project = ProjectSettings(
            name=settings_json['name'],
            project=project_name,
            settings=json.dumps(settings_json),
        )
        current_user.project_settings.append(project)
        db.session.add(project)
    else:
        # update existing project
        new_project = False
        project.settings = json.dumps(settings_json)

    db.session.commit()    
    return jsonify({
        'success': True,
        'settings': {
            'id': project.id,
            'name': project.name,
            'new': new_project
        },
        'message': _('Save project successfully')
    })


@user.post("/settings/load")
@login_required
def load_settings():
    settings_json = request.get_json()
    if 'id' not in settings_json:
        raise BadRequest()

    id = settings_json['id']
    project_settings = ProjectSettings.by_id(id)
    if not project_settings:
        raise NotFound()

    project_name = settings_json.get('project_name', None)
    ajax = settings_json.get('ajax', False)
    if ajax:
        settings = json.loads(project_settings.settings)
        return jsonify({
            'success': True, 
            'settings': settings,
            'message': _('Load project successfully')
        })

    session['project_setting_id'] = project_settings.id

    return jsonify({
        'success': True, 
        'redirect': url_for('munimap.index', config=project_name),
        'message': _('Load project successfully'),
    })



@user.post("/settings/default/update")
@login_required
def update_default_settings():
    settings_json = request.get_json()

    project_name = settings_json['projectName']
    id = settings_json['defaultSettingsID']

    protected_project = ProtectedProject.by_name(project_name)

    if not id:
        default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)
        if default_settings:
            db.session.delete(default_settings)
            db.session.commit()
        return jsonify({
            'success': True 
        })

    project_settings = ProjectSettings.by_id(id)
    if not project_settings:
        raise NotFound()

    default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)
    if not default_settings: 
        default_settings = ProjectDefaultSettings(
            project=protected_project,
            project_settings=project_settings,
            user=current_user
        )
        db.session.add(default_settings)
    else:
        default_settings.mm_project_settings_id = project_settings.id
    
    db.session.commit()

    return jsonify({
        'success': True 
    })


@user.post("/settings/delete")
@login_required
def delete_settings():
    settings_json = request.get_json()
    if 'id' not in settings_json:
        raise BadRequest()

    settings_id = settings_json['id']
    project_settings = ProjectSettings.by_id(settings_id)
    protected_project = ProtectedProject.by_name_without_404(project_settings.project)
    if protected_project:
        project_default_settings = ProjectDefaultSettings.by_project_and_user(protected_project, current_user)
        if project_default_settings and project_default_settings.mm_project_settings_id == settings_id:
            db.session.delete(project_default_settings)

    db.session.delete(project_settings)
    db.session.commit()

    return jsonify({
        'success': True, 
        'settings': {'id': settings_id},
        'message': _('Delete project successfully')
    })

