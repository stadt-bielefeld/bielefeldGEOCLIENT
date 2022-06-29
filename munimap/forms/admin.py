from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, TextAreaField, BooleanField, DateField
from wtforms.validators import InputRequired, Optional, ValidationError
from sqlalchemy import func

from munimap.helper import _l, _
from munimap.model import MBUser


class MBGroupForm(FlaskForm):
    name = StringField(_l('name'), validators=[InputRequired()])
    title = StringField(_l('title'), validators=[InputRequired()])
    description = TextAreaField(_l('description'))


class ProjectForm(FlaskForm):
    name = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


class NewProjectForm(FlaskForm):
    new = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


class SelectionlistForm(FlaskForm):
    name = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


class NewSelectionlistForm(FlaskForm):
    new = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


class PluginForm(FlaskForm):
    name = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


class NewPluginForm(FlaskForm):
    new = StringField(_l('name'), validators=[InputRequired()])
    code = TextAreaField(_l('code'))


def check_user_name(form, field):
    if MBUser.query.filter(
                func.lower(MBUser.mb_user_name) == func.lower(field.data)
            ).first():
        raise ValidationError(_('Username %(name)s already exist', name=field.data))


class NewUserForm(FlaskForm):
    mb_user_id = StringField('mb_user_id')
    mb_user_name = StringField('mb_user_name', validators=[InputRequired(), check_user_name])
    mb_user_firstname = StringField('mb_user_firstname', validators=[InputRequired()])
    mb_user_lastname = StringField('mb_user_lastname', validators=[InputRequired()])
    mb_user_academictitle = StringField('mb_user_academictitle')
    mb_user_password = StringField('mb_user_password', validators=[InputRequired()])
    mb_user_email = StringField('mb_user_email', validators=[InputRequired()])
    mb_user_description = StringField('mb_user_description')
    mb_user_phone = StringField('mb_user_phone')
    mb_user_facsimile = StringField('mb_user_facsimile')
    mb_user_street =StringField('mb_user_street')
    mb_user_housenumber = StringField('mb_user_housenumber')
    mb_user_delivery_point = StringField('mb_user_delivery_point')
    mb_user_postal_code = IntegerField('mb_user_postal_code', validators=[Optional(strip_whitespace=True)])
    mb_user_city = StringField('mb_user_city')
    mb_user_country = StringField('mb_user_country')
    mb_user_organisation_name = StringField('mb_user_organisation_name')
    mb_user_department = StringField('mb_user_department')
    mb_user_position_name = StringField('mb_user_position_name')
    mb_user_dienstkey = StringField('mb_user_dienstkey')
    mb_user_active = BooleanField('mb_user_active')
    mb_user_idm_managed = BooleanField('mb_user_idm_managed')
    mb_user_valid_to = DateField('mb_user_valid_to', format='%d.%m.%Y', validators=[Optional(strip_whitespace=True)])


class EditUserForm(FlaskForm):
    mb_user_id = StringField('mb_user_id')
    mb_user_name = StringField('mb_user_name', validators=[InputRequired()])
    mb_user_firstname = StringField('mb_user_firstname', validators=[InputRequired()])
    mb_user_lastname = StringField('mb_user_lastname', validators=[InputRequired()])
    mb_user_academictitle = StringField('mb_user_academictitle')
    mb_user_password = StringField('mb_user_password')
    mb_user_email = StringField('mb_user_email', validators=[InputRequired()])
    mb_user_description = StringField('mb_user_description')
    mb_user_phone = StringField('mb_user_phone')
    mb_user_facsimile = StringField('mb_user_facsimile')
    mb_user_street =StringField('mb_user_street')
    mb_user_housenumber = StringField('mb_user_housenumber')
    mb_user_delivery_point = StringField('mb_user_delivery_point')
    mb_user_postal_code = IntegerField('mb_user_postal_code')
    mb_user_city = StringField('mb_user_city')
    mb_user_country = StringField('mb_user_country')
    mb_user_organisation_name = StringField('mb_user_organisation_name')
    mb_user_department = StringField('mb_user_department')
    mb_user_position_name = StringField('mb_user_position_name')
    mb_user_dienstkey = StringField('mb_user_dienstkey')
    mb_user_login_count = IntegerField('mb_user_login_count')
    mb_user_active = BooleanField('mb_user_active')
    mb_user_idm_managed = BooleanField('mb_user_idm_managed')
    mb_user_valid_to = DateField('mb_user_valid_to', format='%d.%m.%Y', validators=[Optional(strip_whitespace=True)])
