from os import path
import datetime


class DefaultConfig(object):
    """
    Default configuration for a newsmeme application.
    """

    DEBUG = False

    MATOMO = False
    MATOMO_URL = ''
    MATOMO_IMAGE_URL = ''
    
    # ALLOW_UPLOAD_CONFIG = ['127.0.0.1']
    API_PRODUCTION_URL = 'http://localhost:5000'

    ASSETS_DEBUG = False
    ASSETS_BUNDLES_CONF = path.join(path.dirname(__file__), 'asset_bundles.yaml')

    APP_CONFIG_DIR = ''
    DEFAULT_APP_CONFIG = 'default-config.yaml'

    TMP_DIR = '/tmp'

    ALKIS_LEGITIMATION_GROUP = 'ALKIS_BERECHTIGTES_INTERESSE'
    ALKIS_WITH_OWNER_GROUP = 'ALKIS_EIGENTUEMER'
    ALKIS_WITH_OWNER_OFFICIAL = 'ALKIS_EIGENTUEMER_IBR'
    ALKIS_WFS_URL = ''
    ALKIS_WFS_PARAMETER = 'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=Flurstuecke'

    ALKIS_LOG_DIR = '/tmp/'
    LOG_DIR = ''
    ALKIS_LOG = 'munimap.alkis.log'
    TOKEN_LOG = 'munimap.token.log'
    DEBUG_LOG = 'munimap.debug.log'
    ERROR_LOG = 'munimap.error.log'
    TRANSFER_LOG = 'munimap.transfer.log'

    # change this in your production settings !!!
    SECRET_KEY = "verysecret"

    MAX_INVALID_LOGIN_ATTEMPTS = 3
    
    ADMIN_GROUPS = ['admin']

    REMEMBER_COOKIE_NAME = 'remember_muimap_token'
    REMEMBER_COOKIE_DURATION = datetime.timedelta(30)

    LAYERS_CONF_DIR = ''
    LAYERS_BASE_URL = ''
    SQLALCHEMY_LAYER_DATABASE_URI = ''

    SQLALCHEMY_DATABASE_URI = 'postgres://os:os@localhost:5432/munimap'
    SQLALCHEMY_BINDS = {
        'mapbender': 'postgres://mapbender:mapbender@localhost:5432/mapbender'
    }
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_SCHEMA = 'public'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_PROXY = {}
    PROXY_HASH_SALT = 'changeme'

    CERTIFICATE_VERIFY = False
    
    DRAW_ICONS_SUB_DIR = 'draw'
    DRAW_ICONS_CONFIG_FILE = 'draw_icons.yaml'

    MAP_ICONS_DIR = ''

    GEOJSON_DATA_PATH = './geojson/'

    MAPFISH_ICONS_DIR = ''
    MAPFISH_PRINT_CMD = ''
    MAPFISH_YAML = ''
    MAPFISH_STYLES_PATH = ''
    MAPFISH_SERVICES_DEFAULT_PROTOCOL = 'http'

    MAPFISH_PRINT_USE_SERVICE = False
    MAPFISH_PRINT_URL = ''

    # in px
    MAPFISH_PRINT_MAP_MARGINS = [20, 20, 40, 20]

    PRINT_OUTDIR = './print-output'
    PRINT_USE_BROKER = False
    PRINT_QUEUEFILE = './printqueue.sqlite'
    PRINT_STREET_INDEX_LAYER = 'street_labels'

    INVERT_LEFT_GRID_LABELS = False
    INVERT_TOP_GRID_LABELS = False
    GRID_LABELS = None

    PROJECT_DIR = path.join(path.dirname(__file__), '../projects/demo')

    ACCEPT_LANGUAGES = ['de']

    # Digitize default configurations
    DIGITIZE_ADMIN_GROUP = 'digitize_admin'
    DIGITIZE_EDIT_GROUP = 'digitize_edit'
    DIGITIZE_ICON_DIR = ''
    DIGITIZE_ICON_CONFIG_FILE = False

    # Transport default configurations
    TRANSPORT_OPERATOR = '%'
    TRANSPORT_MAX_EXTENT = [-180, -85, 180, 85]  # to limit and speed-up db queries

    TIMETABLE_SERVICE_URL = 'http://efa.vrr.de/vrr/XSLT_TRIP_REQUEST2'
    TIMETABLE_SERVICE_CHARSET = 'ISO-8859-15'

    TIMETABLE_DEFAULT_CTIY = 'Bielefeld'

    TIMETABLE_STATIC_FIELDS = [
        ('language', 'de'),
        ('0', 'sessionID'),
        ('type_origin', 'stop'),
        ('type_destination', 'stop'),
        # timetable style for given company
        ('itdLPxx_transpCompany', 'mobiel2')
    ]
    TIMETABLE_DOCUMENTS_CSV = False
    TIMETABLE_DOCUMENTS_BASE_URL = ''

    TIMETABLE_NIGHTLINE_CSV = False
    TIMETABLE_NIGHTLINE_DOCUMENTS_BASE_URL = ''

    ALKIS_SESSION_URL = '/iplogin/services/LoginService/getSessionNeu?'
    ALKIS_INFO_URL = '/ip_alkisservices/services/AlkisBuchinfoService/getFlurstuecksinfoDocument?'
    ALKIS_PDF_URL = '/ALKISBuch/indexIPProduct.html?'

    # use for response urls
    ALKIS_BASE_URL = '/ip_alkisservices'
    ALKIS_OFFICIAL_URL = '/ALKISBuch/indexMapBenderProduct.html?'

    IP_CONNECT_ID = 'alkistest|alkistest'
    ALKIS_GML_WMS = '/umn/wms_alkis_arbeitsausgabe_v01.asp?'

    NO_LOGIN_INFORMATION = 'Bitte kontaktieren Sie den Adminstrator <a href="mailto:admin@example.org">admin@example.org</a>'

here = path.dirname(__file__)


class TestConfig(object):
    DEBUG = True
    ASSETS_DEBUG = True

    APP_CONFIG_DIR = path.join(here, 'test/data/app/')

    LAYERS_CONF = path.join(here, 'test/data/test_layers_conf.yaml')

    SQLALCHEMY_DATABASE_URI = 'postgres://postgres:postgres@localhost:5555/munimap_test'

    SQLALCHEMY_LAYER_DATABASE_URI = 'postgres://osm:osm@localhost:5555/osm'
    SQLALCHEMY_DATABASE_SCHEMA = 'munimaptest'

    SQLALCHEMY_BINDS = {
        'mapbender': 'postgres://postgres:postgres@localhost:5555/munimap_test'
    }

    MAP_ICONS_DIR = path.join(here, 'test/data/mapfish/icons')
    MAPFISH_ICONS_DIR = MAP_ICONS_DIR

    MAPFISH_PRINT_CMD = path.join(here, '../dev/mapfish/core-3.3-SNAPSHOT/bin/print')
    MAPFISH_YAML = path.join(here, 'test/data/mapfish.yaml')
    MAPFISH_STYLES_PATH = path.join(here, 'test/data/mapfish/styles/')

    MAPFISH_PRINT_USE_SERVICE = False

    PRINT_OUTDIR = '/tmp/print-output'
    PRINT_USE_BROKER = False
    PRINT_QUEUEFILE = path.join(here, 'test/data/printqueue.sqlite')
    WTF_CSRF_ENABLED = False
