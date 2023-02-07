from wtforms import ValidationError
from wtforms.validators import Optional

from munimap_digitize.model import FeatureGroup, Layer
from flask_babel import lazy_gettext as _l


def group_name_unique(form, field):
    if FeatureGroup.query.filter_by(name=field.data).count() > 0:
        raise ValidationError(_l('Group name already exists'))


def layer_name_unique(id_field):

    def _layer_name_unique(form, field):
        layer_id = form[id_field].data
        if layer_id:
            layer = Layer.query.filter_by(id=layer_id).first()
            if layer and layer.name == field.data:
                return
        if Layer.query.filter_by(name=field.data).count() > 0:
            raise ValidationError(_l('Layer name already exists'))

    return _layer_name_unique


def lower_than(other_field_name):

    def _lower(form, field):
        other_field = form[other_field_name]
        if field.data is None or other_field.data is None:
            return
        if field.data >= other_field.data:
            raise ValidationError(_l('value must be lower %(other_name)s value', other_name=other_field.label.text))
    return _lower


def lower_or_equal_than(other_field_name):

    def _lower_or_equal(form, field):
        other_field = form[other_field_name]
        if field.data is None or other_field.data is None:
            return
        if field.data > other_field.data:
            raise ValidationError(_l('value must be lower or equal %(other_name)s value', other_name=other_field.label.text))
    return _lower_or_equal


def greater_than(other_field_name):

    def _greater(form, field):
        other_field = form[other_field_name]
        if field.data is None or other_field.data is None:
            return
        if field.data <= other_field.data:
            raise ValidationError(_l('value must be greater %(other_name)s value', other_name=other_field.label.text))
    return _greater


def greater_or_equal_than(other_field_name):
    def _greater_or_equal(form, field):
        other_field = form[other_field_name]
        if field.data is None or other_field.data is None:
            return
        if field.data < other_field.data:
            raise ValidationError(_l('value must be greater or equal %(other_name)s value', other_name=other_field.label.text))
    return _greater_or_equal


class RequiredIf(Optional):
    # a validator which makes a field required if
    # another field is set and has a truthy value
    #
    # found at http://stackoverflow.com/a/8464478

    def __init__(self, other_field_name, *args, **kwargs):
        self.other_field_name = other_field_name
        super(RequiredIf, self).__init__(*args, **kwargs)

    def __call__(self, form, field):
        other_field = form._fields.get(self.other_field_name)
        if other_field is None:
            raise Exception(
                'no field named "%s" in form' % self.other_field_name)
        if bool(field.data):
            return
        elif not bool(other_field.data):
            super(RequiredIf, self).__call__(form, field)
        else:
            raise ValidationError(_l('Can not be empty if %(other_name)s is set', other_name=other_field.label.text))
