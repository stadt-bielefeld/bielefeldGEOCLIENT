from os import path
import datetime


class DefaultConfig(object):
    """
    Default configuration for a newsmeme application.
    """

    MATOMO = False
    MATOMO_URL = ''
    MATOMO_IMAGE_URL = ''

    JSONIFY_PRETTYPRINT_REGULAR = False

    ADMIN_PARTY = False

    LOG_DIR = '/opt/log/munimap'

    LOG_STATS = False
    LOG_STATS_FILENAME = '/opt/log/munimap/stats.log'
    LOG_STATS_MAX_BYTES = 1000000  # 1MB
    LOG_STATS_BACKUP_COUNT = 5
    LOG_STATS_WHITELIST = ['http://localhost']

    # Access token of the target server.
    # This should match the API_ACCESS_RECEIVE_TOKEN
    # of the target server.
    API_ACCESS_SEND_TOKEN = False
    # Access token to compare incoming requests with.
    API_ACCESS_RECEIVE_TOKEN = False
    API_PRODUCTION_URL = 'http://localhost'

    PREFERRED_URL_SCHEME = 'http'

    INTERNAL_APP_URL = 'http://localhost:8080'

    # change this in your production settings !!!
    SECRET_KEY = 'verysecret'
    PROXY_HASH_SALT = 'alsoverysecret'

    ALEMBIC_CONF = '/opt/etc/munimap/alembic.ini'

    LAYERS_CONF_DIR = '/opt/etc/munimap/map-configs'
    APP_CONFIG_DIR = '/opt/etc/munimap/app-configs'
    SELECTIONLISTS_CONFIG_DIR = '/opt/etc/munimap/selectionlists-configs'
    PLUGIN_DIR = '/opt/etc/munimap/plugins'
    TOUR_DIR = '/opt/etc/munimap/tours'
    CONTEXTMENU_DIR = '/opt/etc/munimap/contextmenus'
    # Directory that serves static files. When requesting static
    # files, the application will first check the flask default directory,
    # before checking this directory.
    CUSTOM_STATIC_DIR = '/opt/etc/munimap/custom_static'

    DEFAULT_APP_CONFIG = 'default-config.yaml'

    TMP_DIR = '/tmp'

    ALKIS_LEGITIMATION_GROUP = 'ALKIS_BERECHTIGTES_INTERESSE'
    ALKIS_WITH_OWNER_GROUP = 'ALKIS_EIGENTUEMER'
    ALKIS_WITH_OWNER_OFFICIAL = 'ALKIS_EIGENTUEMER_IBR'
    ALKIS_WFS_URL = '/umn/wms_alkis_arbeitsausgabe_v01.asp?'
    ALKIS_WFS_PARAMETER = 'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=Flurstuecke'

    ALKIS_LOG_DIR = '/tmp/'
    ALKIS_LOG = 'munimap.alkis.log'
    TOKEN_LOG = 'munimap.token.log'
    DEBUG_LOG = 'munimap.debug.log'
    ERROR_LOG = 'munimap.error.log'
    TRANSFER_LOG = 'munimap.transfer.log'

    MAX_INVALID_LOGIN_ATTEMPTS = 3

    ADMIN_GROUPS = ['admin']

    REMEMBER_COOKIE_NAME = 'remember_munimap_token'
    REMEMBER_COOKIE_DURATION = datetime.timedelta(30)

    # TODO check which baseUrl we can use here
    LAYERS_BASE_URL = 'http://munimap-nginx'
    SQLALCHEMY_LAYER_DATABASE_URI = ''

    SQLALCHEMY_DATABASE_URI = ''
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_SCHEMA = 'public'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # TODO check if we can provide a local proxy here
    CORS_PROXY = {}

    CERTIFICATE_VERIFY = False

    DRAW_ICONS_SUB_DIR = 'draw'
    DRAW_ICONS_CONFIG_FILE = 'draw_icons.yaml'

    MAP_ICONS_DIR = '/opt/etc/munimap/bielefeld/frontend/img/icons'
    MAPFISH_ICONS_DIR = '/opt/etc/munimap/bielefeld/frontend/img/icons'
    MAPFISH_CLI_ICONS_DIR = '/opt/etc/munimap/bielefeld/frontend/img/icons'

    GEOJSON_DATA_PATH = './geojson/'

    MAPFISH_PRINT_CMD = '/opt/var/mapfish/core-3.9.0/bin/print'
    # TODO add to yaml to repository and Dockerfile
    MAPFISH_YAML = '/opt/etc/munimap/config.yaml'
    # TODO add styles to repository and Dockerfile
    MAPFISH_STYLES_PATH = '/opt/etc/munimap/mapfish/styles'
    MAPFISH_TEMPLATES_PATH = '/opt/etc/munimap/mapfish/templates'
    MAPFISH_SERVICES_DEFAULT_PROTOCOL = 'http'

    MAPFISH_PRINT_BASE_URL = 'http://munimap-print:8080'
    MAPFISH_PRINT_CREATE_URL = '%s/print/munimap/report' % (MAPFISH_PRINT_BASE_URL)

    # in px
    MAPFISH_PRINT_MAP_MARGINS = [20, 20, 40, 20]

    PRINT_JOBSPEC_DIR = '/opt/etc/munimap/printqueue/job-specs'
    PRINT_OUTDIR = '/opt/etc/munimap/printqueue/print-output'
    PRINT_USE_BROKER = True
    PRINT_QUEUEFILE = '/opt/etc/munimap/printqueue/printqueue.sqlite'
    PRINT_STREET_INDEX_LAYER = 'street_labels'
    PRINT_LOG_DIR = '/opt/etc/munimap/printqueue'
    PRINT_DEBUG_LOG = 'printqueue.debug.log'
    PRINT_ERROR_LOG = 'printqueue.error.log'

    INVERT_LEFT_GRID_LABELS = True
    INVERT_TOP_GRID_LABELS = False
    GRID_LABELS = ( 'A B C D E F G H I K L M N O P Q R S T U V W X Y Z'.split(),
        list(map(str, list(range(1, 26)))),
    )

    PROJECT_DIR = '/opt/etc/munimap/bielefeld'

    ACCEPT_LANGUAGES = ['de']

    # Digitize default configurations
    # Polling interval in ms
    DIGITIZE_POLLING_INTERVAL = 15000

    # Transport default configurations
    TRANSPORT_OPERATOR = '%'
    TRANSPORT_MAX_EXTENT = [-180, -85, 180, 85]  # to limit and speed-up db queries

    TIMETABLE_SERVICE_URL = 'https://westfalenfahrplan.de'
    TIMETABLE_STOPFINDER_API = '/nwl-efa/XML_STOPFINDER_REQUEST?coordOutputFormat=WGS84[dd.dddd]&language=de&locationInfoActive=1&locationServerActive=1&nwlStopFinderMacro=1&outputFormat=rapidJSON&serverInfo=1&sl3plusStopFinderMacro=1&type_sf=stop&version=10.4.18.18'
    TIMETABLE_STOPFINDER_PRIORITIES = ['bielefeld', 'bi-']
    TIMETABLE_TRIP_API = '/nwlsl3+/trip?lng=de&sharedLink=true'

    TIMETABLE_DEFAULT_CTIY = 'Bielefeld'

    TIMETABLE_DOCUMENTS_CSV = False
    TIMETABLE_DOCUMENTS_BASE_URL = ''

    TIMETABLE_NIGHTLINE_CSV = False
    TIMETABLE_NIGHTLINE_DOCUMENTS_BASE_URL = ''

    ALKIS_SESSION_URL = '/iplogin/services/LoginService/getSessionNeu?'
    ALKIS_INFO_URL = '/ip_alkisservices/services/AlkisBuchinfoService/'
    ALKIS_PDF_URL = '/ALKISBuch/indexIPProduct.html?'

    # use for response urls
    ALKIS_BASE_URL = '/ip_alkisservices'
    ALKIS_OFFICIAL_URL = '/ALKISBuch/indexMapBenderProduct.html?'

    IP_CONNECT_ID = 'alkistest|alkistest'
    ALKIS_GML_WMS = '/umn/wms_alkis_arbeitsausgabe_v01.asp?'

    NO_LOGIN_INFORMATION = 'Bitte kontaktieren Sie den Adminstrator <a href="mailto:admin@example.org">admin@example.org</a>'
    USER_LOGOUT_URL = '/'

    COORD_TRANSFORM_URL = ''

    # why use this? Answer here-> https://github.com/stadt-bielefeld/bielefeldGEOCLIENT/pull/59#discussion_r885749224
    JSON_SORT_KEYS = False


class TestConfig(object):
    here = path.dirname(__file__)

    APP_CONFIG_DIR = path.join(here, 'test/data/app/')

    LAYERS_CONF = path.join(here, 'test/data/test_layers_conf.yaml')

    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:postgres@localhost:5556/mapbender_test'

    SQLALCHEMY_LAYER_DATABASE_URI = 'postgresql://postgres:postgres@localhost:5556/osmdata_test'
    SQLALCHEMY_DATABASE_SCHEMA = 'munimaptest'

    MAP_ICONS_DIR = path.join(here, 'test/data/mapfish/icons')
    MAPFISH_ICONS_DIR = MAP_ICONS_DIR

    MAPFISH_PRINT_CMD = path.join(here, '../dev/mapfish/core-3.3-SNAPSHOT/bin/print')
    MAPFISH_YAML = path.join(here, 'test/data/mapfish.yaml')
    MAPFISH_STYLES_PATH = path.join(here, 'test/data/mapfish/styles/')

    PRINT_OUTDIR = '/tmp/print-output'
    PRINT_JOBSPEC_DIR = '/tmp/job-specs'
    PRINT_USE_BROKER = False
    PRINT_QUEUEFILE = path.join(here, 'test/data/printqueue.sqlite')
    WTF_CSRF_ENABLED = False

    # why use this? Answer here-> https://github.com/stadt-bielefeld/bielefeldGEOCLIENT/pull/59#discussion_r885749224
    JSON_SORT_KEYS = False

