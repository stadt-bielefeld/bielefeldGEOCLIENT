from flask_wtf import FlaskForm
from wtforms import SubmitField, HiddenField
from wtforms_sqlalchemy.fields import QuerySelectField

from munimap.helper import _l
from munimap.model import ProjectSettings

def projects_query_factory():
    return ProjectSettings.query

class ProjectSettingsForm(FlaskForm):

    settings = QuerySelectField(
        _l('Settings'),
        query_factory=projects_query_factory,
        allow_blank=True,
        blank_text=_l('Standard')
    )
    name = HiddenField(_l('Import Settings'))
    import_button = SubmitField(_l('Import Project'))
    export_button = SubmitField(_l('Export Project'))
    load_button = SubmitField(_l('Start Project'))
