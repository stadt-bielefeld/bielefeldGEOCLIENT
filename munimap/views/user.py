
import json

import datetime

from flask import (
    render_template,
    Blueprint,
    flash,
    redirect,
    url_for,
    request,
    current_app,
    jsonify,
    session,
    Response,
    make_response
)

from werkzeug.exceptions import BadRequest, NotFound

from flask_mailman import EmailMessage
from flask_login import login_user, logout_user, login_required, current_user
from flask_babel import gettext as _, to_user_timezone
from munimap.extensions import db, mail

# from munimap.extensions import db
from munimap.model import (
    MBUser, 
    ProtectedProject, 
    ProjectDefaultSettings, 
    EmailVerification,
)
from munimap.helper import load_app_config, check_group_permission
from munimap.forms.user import (
    LoginForm, 
    UserChangePassword, 
    UserRecoverPassword, 
    RecoverRequestForm,
)
from munimap.forms.project_settings import ProjectSettingsForm
from munimap.model import ProjectSettings

user = Blueprint("user", __name__, url_prefix='/user')


@user.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = MBUser.by_name(form.data['username'])
        if not user:
            form.username.errors = [_("username or password not correct")]
        elif not user.mb_user_active:
            form.username.errors = [_("User not active. Please contact us.")]
        elif user.mb_user_valid_to is not None and datetime.date.today() > user.mb_user_valid_to:
            form.username.errors = [_("Useraccount is expired. Please contact us.")]
        elif user.mb_user_login_count >= current_app.config.get('MAX_INVALID_LOGIN_ATTEMPTS'):
            flash(_('Too many invalid attempts. Please contact us.'), 'error')
            form.username.errors = [_("Too many invalid attempts. Please contact us.")]
        elif not user.check_password(form.data['password']):
            form.username.errors = [_("username or password not correct")]
            user.mb_user_login_count = user.mb_user_login_count + 1
            db.session.commit() 
        else:
            login_user(user, remember=True)
            user.mb_user_login_count = 0
            db.session.commit()

            flash(_('Logged in successfully'), 'success')
            next = request.args.get("next")
            return redirect(next or url_for("user.projects"))

    if current_user.is_authenticated:
        return redirect(url_for("user.projects"))

    return render_template("munimap/user/login.html", form=form)


@user.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(current_app.config.get('USER_LOGOUT_URL'))


@user.route("/settings/password", methods=["GET", "POST"])
@login_required
def change_password():
    form = UserChangePassword()
    if form.validate_on_submit():
        if current_user.check_password(form.data['password_old']):
            current_user.update_password(form.data['password'])
            db.session.commit()
            flash(_('Change password successfully'), 'success')
            return redirect(url_for("user.projects"))
        else:
            flash(_('Old Password is not correct'), 'error')
    return render_template("munimap/user/password.html", form=form)


@user.route("/password/recover", methods=["GET", "POST"])
def recover_password():
    form = RecoverRequestForm()
    if form.validate_on_submit():
        user = MBUser.by_name(form.data['username'])
        recover = EmailVerification.recover(user)
        db.session.add(recover)
        db.session.commit()

        msg = EmailMessage(
            subject=_('Password recover mail subject'),
            body=render_template('munimap/emails/recover_mail.txt', user=user, recover=recover),
            to=[user.email]
        )

        if current_app.config.get('DEBUG'):
            print(msg.body)
        else:
            msg.send(msg)

        flash(_('Mail with instructions will be send'), 'success')
        return redirect(url_for('user.login'))

    return render_template('munimap/user/password_recover.html', form=form)


@user.route("/password/<uuid>/recover", methods=["GET", "POST"])
def set_new_password(uuid):
    verify = EmailVerification.by_hash(uuid)
    if not verify:
        raise NotFound()
    
    if verify.expired:
        flash(_('Recovery link is not valid anymore. Please request a new one'), 'error')
        return redirect(url_for("user.login"))
        
    user = verify.user
    form = UserRecoverPassword()
    if form.validate_on_submit():
        user.update_password(form.data['password'])
        db.session.delete(verify)
        user.mb_user_login_count = 0
        db.session.commit()
        login_user(user)
        flash(_('Change password successfully'), 'success')
        return redirect(url_for("user.projects"))

    return render_template(
        "munimap/user/password_recover_set.html",
        user=user,
        form=form,
        verify=verify,
        uuid=uuid
    )
