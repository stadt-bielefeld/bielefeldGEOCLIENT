import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import '@babel/polyfill';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

require('angular-schema-form');
require('angular-schema-form-bootstrap');
require('anol/src/anol/anol.js');

require('./default-munimap-config.js');
require('./base-config.js');
require('./draw-layer-config.js');
require('./base-app.js');
require('./base-controller.js');

require('./geoeditor/geoeditor-module.js');
require('./digitize/digitize-module.js');
require('./draw-popup-controller.js');
require('./catalog-modal-controller.js');
require('./settings-modal-controller.js');

require('./modules/confirm.js');
require('./modules/colorpicker.js');
require('./modules/datepicker.js');
require('./modules/plaintext.js');
require('./modules/notifications.js');
require('./modules/sidebar.js');
require('./modules/servicebutton.js');
require('./modules/alkisbutton.js');
require('./modules/slider-directive.js');
require('./modules/slider.js');
require('./modules/moveablemodal.js');
require('./modules/postmessage-service.js');

require('./alkis/simple.js');
require('./alkis/pdf.js');
require('./alkis/selection.js');
require('./alkis/simple.js');
require('./alkis/official.js');

require('./munimap-config.js');

require('../../../munimap_transport/munimap_transport/frontend/js/layers.js');
require('../../../munimap_transport/munimap_transport/frontend/js/transport-controller.js');
require('../../../munimap_transport/munimap_transport/frontend/js/route-controller.js');
require('../../../munimap_transport/munimap_transport/frontend/js/transport-api-service.js');
require('../../../munimap_transport/munimap_transport/frontend/js/timetable-controller.js');

