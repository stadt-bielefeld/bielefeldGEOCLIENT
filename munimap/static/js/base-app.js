import { get as getProj } from 'ol/proj';

angular.module('munimapBase')

    .run(['PermalinkService', 'UrlMarkersService', '$rootScope', 'munimapConfig',
        function(PermalinkService, UrlMarkersService, $rootScope, munimapConfig) {
            $rootScope.backgroundlayerPreviewUrl = munimapConfig.app.backgroundlayerPreviewUrl;
        }
    ]);

angular.element(document).ready(function() {
    var printConfig = {
        printUrl: undefined
    };
    try {
        printConfig.printUrl = printUrl;
    } catch (e) {
        angular.noop();
    }

    var configObject = $.extend(true, {}, defaultMunimapConfig, {
        printConfig: printConfig
    }, appConfig);

    // get projection object from epsg code
    var projection = getProj(configObject.map.projection);
    if(configObject.map.projectionExtent !== undefined) {
        projection.setExtent(configObject.map.projectionExtent);
    }
    angular.module('munimapBase').constant('munimapConfig', configObject);

    if(typeof imageUrl === 'undefined') {
        imageUrl = '';
    }

    angular.module('munimapBase')
        .constant('imageUrl', imageUrl);
        
    angular.bootstrap(document, ['munimapBase', 'munimap']);
});