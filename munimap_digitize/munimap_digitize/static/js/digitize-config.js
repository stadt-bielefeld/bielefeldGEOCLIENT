
import GeoJSON from 'ol/format/GeoJSON';

angular.module('munimap', [
    'anol.draw',
    'anol.featurepopup',
    'anol.featurepropertieseditor',
    'anol.featurestyleeditor',
    'anol.legend',
    'anol.print',
    'anol.savemanager',
    'munimapBase.confirm',
    'schemaForm',
    'ui.bootstrap-slider',
    'angularSpectrumColorpicker'
])

    .config(['PrintServiceProvider', 'PrintPageServiceProvider', 'munimapConfig',
        function(PrintServiceProvider, PrintPageServiceProvider, munimapConfig) {
            return false;
        }])

    .config(['SaveManagerServiceProvider',
        function(SaveManagerServiceProvider) {
            SaveManagerServiceProvider.setSaveUrl(saveUrl);
        }]);