from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, ValidationError
from wtforms.validators import InputRequired, EqualTo, Length

from munimap.helper import _l, _
from munimap.model import (
    MBUser, 
    ProtectedProject, 
    ProjectDefaultSettings, 
    EmailVerification,
)

def username_exists(form, field):
    if not MBUser.by_name(field.data):
        raise ValidationError(_('Username does not exist'))

class LoginForm(FlaskForm):
    username = StringField(_l('Username'), [
        InputRequired()
    ])
    password = PasswordField(_l('Password'), [
        InputRequired()
    ])

class UserChangePassword(FlaskForm):
    password_old = PasswordField(
    	_l('Old Password')
    )
    password = PasswordField(_l('New Password'), [
        Length(min=6),
        EqualTo('password2', message=_l("Passwords must match"))])
    password2 = PasswordField(_l('New Password repeat'))

class RecoverRequestForm(FlaskForm):
    username = StringField(
        _l('Username'), [InputRequired(), username_exists])

class UserRecoverPassword(FlaskForm):
    password = PasswordField(_l('New Password'), [
        Length(min=6),
        EqualTo('password2', message=_l("Passwords must match"))])
    password2 = PasswordField(_l('New Password repeat'))
