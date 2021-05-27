from wtforms import ValidationError

from munimap.model import MBUser
from flask.ext.babel import lazy_gettext as _l


def email_exist(form, field):
    if not MBUser.by_email(field.data):
        raise ValidationError(_l('email or password not correct'))
