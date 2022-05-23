from flask_wtf import FlaskForm
from wtforms import (
    StringField, IntegerField, FloatField, SelectField, HiddenField,
    DateField, DateTimeField
)
from wtforms.validators import (
    InputRequired, NumberRange, Regexp, Optional, Length
)

from munimap.helper import _l
from munimap_digitize.forms.validators import (
    layer_name_unique, lower_or_equal_than,
    greater_or_equal_than
)

COLOR_REGEX = r'^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$'
LAYER_NAME_REGEX = r'^[0-9a-z_]+$'


class EditPropertiesForm(FlaskForm):
    @classmethod
    def from_schema(cls, schema):
        for name, options in list(schema['properties'].items()):
            title_field = StringField(_l('Title'), [InputRequired()],
                                      default=options['title'])
            setattr(cls, name, title_field)
            # TODO add select field with posible property types like
            # 'boolean', 'textarea', etc
        form = cls()
        return form


class AddPropertyForm(FlaskForm):
    name = StringField(_l('Name'), [
        InputRequired(),
        Length(min=2, max=25),
        Regexp(r'^[a-zA-Z]+$', message=_l('Only characters are allowed')),
    ])
    title = StringField(_l('Title'), [
        InputRequired()
    ])


class StyleForm(FlaskForm):
    # used lower camel case field names, so no mapping to correct json is
    # needed
    radius = IntegerField(_l('Radius'), [NumberRange(min=0), Optional()])
    graphicRotation = IntegerField(_l('rotation'), [
        NumberRange(min=-180, max=180),
        Optional()
    ])
    strokeColor = StringField(_l('Stroke color'), [
        Regexp(COLOR_REGEX, message=_l(
            'Color must be in format "#fff" or "#ffffff"')), Optional()])
    strokeWidth = IntegerField(_l('Stroke width'), [
        NumberRange(min=0), Optional()])
    strokeOpacity = FloatField(_l('Stroke opacity'), [
        NumberRange(min=0, max=1), Optional()])
    strokeDashstyle = SelectField(_l('Stroke dashstyle'), [Optional()],
                                  default=None,
                                  filters=[lambda x: x or None],
                                  choices=[
        ('solid', _l('solid')),
        ('dot', _l('dot')),
        ('dash', _l('dash')),
        ('dashdot', _l('dashdot')),
        ('longdash', _l('longdash')),
        ('longdashdot', _l('longdashdot')),
    ])
    fillColor = StringField(_l('Fill color'), [
        Regexp(COLOR_REGEX, message=_l(
            'Color must be in format "#fff" or "#ffffff"')), Optional()])
    fillOpacity = FloatField(_l('Fill opacity'), [
        NumberRange(min=0, max=1), Optional()])
    fontSize = SelectField(_l('Font size'), [Optional()],
                           default=None,
                           filters=[lambda x: x or None],
                           choices=[
        ('6px', '6px'),
        ('8px', '8px'),
        ('10px', '10px'),
        ('12px', '12px'),
        ('14px', '14px'),
        ('16px', '16px')
    ])
    fontWeight = SelectField(_l('Font weight'), [Optional()],
                             default=None,
                             filters=[lambda x: x or None],
                             choices=[
        ('normal', _l('normal')),
        ('italic', _l('italic')),
        ('bold', _l('bold'))
    ])
    fontColor = StringField(_l('Font color'), [
        Regexp(COLOR_REGEX, message=_l(
            'Color must be in format "#fff" or "#ffffff"')), Optional()])

    fontRotation = IntegerField(_l('rotation'), [
        NumberRange(min=-180, max=180),
        Optional()
    ])

# TODO make configurable
MIN_SCALES = [
    # scale, displayed text
    (17471320, '19.200.000'),
    (8735660, '9.600.000'),
    (4367830, '4.800.000'),
    (2183915, '2.400.000'),
    (1091957, '1.200.000'),
    (545978, '600.000'),
    (272989, '300.000'),
    (136494, '150.000'),
    (68247, '75.000'),
    (34123, '40.000'),
    (17061, '20.000'),
    (8530, '10.000'),
    (4265, '5.000'),
    (2132, '2.500'),
    (1066, '1.000'),
    (533, '500'),
]

# matches calculated scales for mapfish print in bbox mode
MAX_SCALES = [
    (22118400, '19.200.000'),
    (11059200, '9.600.000'),
    (5529600, '4.800.000'),
    (2764800, '2.400.000'),
    (1382400, '1.200.000'),
    (691200, '600.000'),
    (345600, '300.000'),
    (172800, '150.000'),
    (86400, '75.000'),
    (43200, '40.000'),
    (21600, '20.000'),
    (10800, '10.000'),
    (5400, '5.000'),
    (2700, '2.500'),
    (1080, '1.000'),
    (540, '500'),
]


def create_scale_choices(scales):
    choices = [('', '')]
    choices += [
        (
            scale[0], 'Level %(level)s (1 : %(scale)s)' % {
                'level': level,
                'scale': scale[1]
            }
        )
        for level, scale in enumerate(scales)
    ]
    return choices


class GroupForm(FlaskForm):
    title = StringField(_l('Title'), [InputRequired()])

    max_scale = SelectField(
        _l('Max scale'),
        [Optional(), greater_or_equal_than('min_scale')],
        default=None,
        coerce=lambda x: int(x) if x else None,
        filters=[lambda x: x or None],
        choices=create_scale_choices(MAX_SCALES)
    )
    min_scale = SelectField(
        _l('Min scale'),
        [Optional(), lower_or_equal_than('max_scale')],
        default=None,
        coerce=lambda x: int(x) if x else None,
        filters=[lambda x: x or None],
        choices=create_scale_choices(MIN_SCALES)
    )
    start_date = DateField(
        _l('Start date'),
        [Optional()],
        default=None,
        format='%d.%m.%Y',
        render_kw={'placeholder': _l('DD.MM.YYYY')}
    )
    start_time = DateTimeField(
        _l('Start time'),
        [Optional()],
        default=None,
        format='%H:%M',
        render_kw={'placeholder': _l('hh:mm')}
    )
    end_date = DateField(
        _l('Ends at'),
        [Optional()],
        default=None,
        format='%d.%m.%Y',
        render_kw={'placeholder': _l('DD.MM.YYYY')}
    )
    end_time = DateTimeField(
        _l('End time'),
        [Optional()],
        default=None,
        format='%H:%M',
        render_kw={'placeholder': _l('hh:mm')}
    )


class LayerForm(FlaskForm):
    name = StringField(_l('Name'), [
        InputRequired(),
        layer_name_unique(id_field='id'),
        Regexp(LAYER_NAME_REGEX, message=_l('Only 0-9 a-z and _ allowed'))
    ])
    id = HiddenField()
    title = StringField(_l('Title'), [InputRequired()])
