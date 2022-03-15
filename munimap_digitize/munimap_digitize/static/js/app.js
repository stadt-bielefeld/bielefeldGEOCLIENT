import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import '@babel/polyfill';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

require('anol/src/anol/anol.js');
require('./../../../../munimap/static/js/default-munimap-config.js');

require('./../../../../munimap/static/js/base-config.js');
require('./../../../../munimap/static/js/base-app.js');
require('./../../../../munimap/static/js/base-controller.js');
require('./../../../../munimap/static/js/settings-modal-controller.js');

require('./../../../../munimap/static/js/modules/confirm.js');
require('./../../../../munimap/static/js/modules/colorpicker.js');
require('./../../../../munimap/static/js/modules/notifications.js');
require('./../../../../munimap/static/js/modules/sidebar.js');
require('./../../../../munimap/static/js/modules/servicebutton.js');
require('./../../../../munimap/static/js/modules/slider.js');
require('./../../../../munimap/static/js/modules/slider-directive.js');
require('./../../../../munimap/static/js/modules/postmessage-service.js');

require('angular-schema-form');
require('angular-schema-form-bootstrap');

require('./digitize-config.js');
require('./digitize-controller.js');
