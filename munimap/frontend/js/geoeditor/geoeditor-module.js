angular.module('munimapGeoeditor', ['anol.drawer', 'anol.featurepopup'])
    .run(['munimapConfig', function (munimapConfig) {

    }]);

require('./geoeditor-validation-service');
require('./geoeditor-popup-controller');
require('./geoeditor-draw-controller');
