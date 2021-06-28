angular.module('munimapGeoeditor', ['anol.mobiledrawer', 'anol.featurepopup'])
    .run(['munimapConfig', function (munimapConfig) {

    }]);

require('./geoeditor-validation-service');
require('./geoeditor-popup-controller');
require('./geoeditor-draw-controller');
