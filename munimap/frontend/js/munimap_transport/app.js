import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import '@babel/polyfill';

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
register(proj4);

import '../../../../munimap/frontend/sass/transport.sass';

require('angular');
require('anol/src/anol/anol.js');

require('./../../../../munimap/frontend/js/default-munimap-config.js');
require('./../../../../munimap/frontend/js/base-config.js');
require('./../../../../munimap/frontend/js/base-app.js');
require('./../../../../munimap/frontend/js/base-controller.js');
require('./../../../../munimap/frontend/js/modules/confirm.js');
require('./../../../../munimap/frontend/js/modules/notifications.js');
require('./../../../../munimap/frontend/js/modules/sidebar.js');
require('./../../../../munimap/frontend/js/modules/servicebutton.js');
require('./../../../../munimap/frontend/js/modules/postmessage-service.js');

require('./transport-config.js');
require('./layers.js');
require('./transport-controller.js');
require('./route-controller.js');
require('./transport-api-service.js');
require('./timetable-controller.js');
