import '@babel/polyfill';

import "../../sass/app.sass";

require('angular');

require('./base.js');
require('./model-service.js');

require('./groups-controller.js');
require('./group-form-controller.js');
require('./group-list-controller.js');

require('./layers-controller.js');
require('./layer-list-controller.js');

require('./projects-controller.js');
require('./project-edit-controller.js');
require('./project-list-controller.js');

require('./users-controller.js');
require('./user-list-controller.js');
require('./user-edit-controller.js');
require('./user-duplicate-controller.js');

require('./maps-list-controller.js');
require('./maps-edit-controller.js');

require('./logs-list-controller.js');

require('./selectionlist-list-controller.js');
require('./selectionlist-edit-controller.js');

require('./plugins-list-controller.js');
require('./plugins-edit-controller.js');
