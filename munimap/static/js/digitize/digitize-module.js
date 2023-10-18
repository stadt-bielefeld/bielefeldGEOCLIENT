angular.module('munimapDigitize', [
  'ui.bootstrap',
  'anol.drawer',
  'anol.featurepopup'
])
    .run(['munimapConfig', function (munimapConfig) {

    }]);

// TODO check if we need a validation service
// require('./geoeditor-validation-service');
require('./digitize-popup-controller');
require('./digitize-controller');
