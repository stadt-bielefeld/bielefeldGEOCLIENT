require('angular');

require('jquery-ui');
require('jquery-ui/ui/widgets/sortable');
require('jquery-ui/ui/disable-selection');
require('angular-ui-sortable');

require('anol/src/modules/module.js');
require('anol/src/modules/map/map-service.js');
require('anol/src/modules/legend/legend-directive.js');

require('anol/src/modules/attribution/attribution-directive.js');
require('anol/src/modules/catalog/catalog-directive.js');
require('anol/src/modules/catalog/catalog-service.js');

require('anol/src/modules/datepicker/datepicker-directive.js');
require('anol/src/modules/featurepopup/dragpopup-directive.js');
require('anol/src/modules/draw/draw-directive.js');
require('anol/src/modules/draw/draw-service.js');
require('anol/src/modules/featureexchange/featureexchange-directive.js');

require('anol/src/modules/featurepopup/featurepopup-directive.js');
require('anol/src/modules/featurepopup/featurepopup-service.js');

require('anol/src/modules/featureform/featureform-directive.js');

require('anol/src/modules/featurepropertieseditor/featurepropertieseditor-directive.js');
require('anol/src/modules/featureproperties/featureproperties-directive.js');
require('anol/src/modules/featurestyleeditor/featurestyleeditor-directive.js');
require('anol/src/modules/geocoder/geocoder-directive.js');
require('anol/src/modules/geocoder/geocoder-service.js');

require('anol/src/modules/geolocation/geolocation-directive.js');
require('anol/src/modules/getfeatureinfo/getfeatureinfo-directive.js');
require('anol/src/modules/layerswitcher/layerswitcher-directive.js');
require('anol/src/modules/map/map-directive.js');
require('anol/src/modules/measure/measure-directive.js');
require('anol/src/modules/measure/measure-service.js');
require('anol/src/modules/mouseposition/mouseposition-directive.js');
require('anol/src/modules/overviewmap/overviewmap-directive.js');
require('anol/src/modules/permalink/permalink-service.js');
require('anol/src/modules/print/print-directive.js');
require('anol/src/modules/print/print-service.js');
require('anol/src/modules/print/printpage-service.js');
require('anol/src/modules/rotate/rotate-directive.js');
require('anol/src/modules/savemanager/savemanager-directive.js');
require('anol/src/modules/savemanager/savemanager-service.js');
require('anol/src/modules/transparencysettings/transparencysettings-directive.js');

require('anol/src/modules/savesettings/savesettings-directive.js');
require('anol/src/modules/savesettings/savesettings-service.js');

require('anol/src/modules/scale/scaleline-directive.js');
require('anol/src/modules/scale/scaletext-directive.js');

require('anol/src/modules/urlmarkers/urlmarker-directive.js');
require('anol/src/modules/urlmarkers/urlmarker-service.js');
require('anol/src/modules/urlmarkers/urlmarker-bbcode-directive.js');
require('anol/src/modules/zoom/zoom-directive.js');

require('anol/src/modules/drawer/drawer-directive.js');

import View from 'ol/View';
import { transformExtent, transform } from 'ol/proj';
import { defaults as defaultInteractions } from 'ol/interaction';
import PinchZoom from 'ol/interaction/PinchZoom';
import DragPan from 'ol/interaction/DragPan';
import ExtendedMouseWheelZoom from './ol3-ext/extended-mouse-wheel-zoom.js';

angular.module('munimapBase', [
    'anol.permalink',
    'anol.savesettings',
    'anol.zoom',
    'anol.overviewmap',
    'anol.scale',
    'anol.attribution',
    'anol.geolocation',
    'anol.featureexchange',
    'anol.featurepopup',
    'anol.featureproperties',
    'anol.geocoder',
    'anol.layerswitcher',
    'anol.legend',
    'anol.permalink',
    'anol.zoom',
    'anol.rotation',
    'anol.urlmarkers',
    'anol.draw',
    'anol.featureform',
    'anol.featurestyleeditor',
    'anol.catalog',
    'anol.mouseposition',
    'anol.transparencysettings',
    'munimapBase.notification',
    'munimapBase.sidebar',
    'munimapBase.servicebutton',
    'munimapBase.postMessage',
    'ui.sortable',
])

    .value('Tour', false)
    .value('ContextMenuItems', false)

    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('');
    }])

    .config(['$translateProvider', 'munimapConfig', function ($translateProvider, munimapConfig) {
        var translations = deDETranslation;
        translations.featureproperties = deDEFeatureProperties;
        $translateProvider.translations('de_DE', translations);
        $translateProvider.preferredLanguage(munimapConfig.app.preferredLanguage);
    }])

    .config(['MapServiceProvider', 'LayersServiceProvider', 'ClusterSelectServiceProvider', 'munimapConfig',
        function (MapServiceProvider, LayersServiceProvider, ClusterSelectServiceProvider, munimapConfig) {
            MapServiceProvider.addView(new View({
                projection: munimapConfig.map.projection,
                center: transform(
                    munimapConfig.map.center || [0, 0],
                    munimapConfig.map.centerProjection || 'EPSG:4326',
                    munimapConfig.map.projection
                ),
                zoom: munimapConfig.map.zoom || 0,
                minZoom: munimapConfig.map.minZoom,
                maxZoom: munimapConfig.map.maxZoom,
                extent: munimapConfig.map.maxExtent
            }));
            if (angular.isDefined(munimapConfig.map.bbox)) {
                MapServiceProvider.setInitialBBox(
                    transformExtent(
                        munimapConfig.map.bbox,
                        munimapConfig.map.bboxProjection || 'EPSG:4326',
                        munimapConfig.map.projection
                    )
                );
            }
            if (angular.isDefined(munimapConfig.map.cluster)) {
                if (angular.isDefined(munimapConfig.map.cluster.distance)) {
                    LayersServiceProvider.setClusterDistance(munimapConfig.map.cluster.distance);
                    delete munimapConfig.map.cluster.distance;
                }
                ClusterSelectServiceProvider.setClusterSelectOptions(munimapConfig.map.cluster);
            }
        }])

    .config(['InteractionsServiceProvider', 'MapServiceProvider', 'munimapConfig', 'KeyZoomText', 'TwoFingersPinchDragText', function (InteractionsServiceProvider, MapServiceProvider, munimapConfig, KeyZoomText, TwoFingersPinchDragText) {
        var interactions = {
            mouseWheelZoom: false,
            pinchZoom: false,
            dragPan: false
        };

        var customInteractions = [];
        // disableMouseZoom
        // enableMouseZoomKey
        if (munimapConfig.app.disableMouseZoom !== true) {
            customInteractions.push(new ExtendedMouseWheelZoom({
                enableCtrlZoom: munimapConfig.app.enableMouseZoomKey,
                keyZoomText: KeyZoomText
            }));
        }

        if ('ontouchstart' in window) {
            // disablePinchZoom
            if (munimapConfig.app.disablePinchZoom !== true) {
                interactions.pinchZoom = true;
            }

            // when pinchMove is disable don't let twoFingersPinchMove be enabled
            if (munimapConfig.app.disablePinchMove === true) {
                munimapConfig.app.enableTwoFingersPinchMove = false;
            }
            // disablePinchMove
            if (munimapConfig.app.disablePinchMove !== true && munimapConfig.app.enableTwoFingersPinchMove !== true) {
                interactions.dragPan = true;
            }
            // enableTwoFingersPinchMove
            MapServiceProvider.setTwoFingersPinchDrag(munimapConfig.app.enableTwoFingersPinchMove);
            MapServiceProvider.setTwoFingersPinchDragText(TwoFingersPinchDragText);
        } else {
            // drag pan only disableable for touch devices
            interactions.dragPan = true;
        }
        InteractionsServiceProvider.setInteractions(interactions);
        InteractionsServiceProvider.setCustomInteractions(customInteractions);

    }])

    .config(['UrlMarkerServiceProvider', 'imageUrl', 'munimapConfig',
        function (UrlMarkerServiceProvider, imageUrl, munimapConfig) {
            if (munimapConfig.urlMarkersConfig === undefined) {
                return;
            }
            var config = munimapConfig.urlMarkersConfig;
            UrlMarkerServiceProvider.setDefaultSrs(config.defaultSrs);
            UrlMarkerServiceProvider.setPropertiesDelimiter(config.propertiesDelimiter);
            UrlMarkerServiceProvider.setKeyValueDelimiter(config.keyValueDelimiter);

            var markerStyle = config.markerStyle;
            if (markerStyle.graphicFile !== undefined) {
                markerStyle.externalGraphic = imageUrl + markerStyle.graphicFile;
                delete markerStyle.graphicFile;
            }
            UrlMarkerServiceProvider.setMarkerStyle(markerStyle);
            UrlMarkerServiceProvider.setUsePopup(config.usePopup);
            UrlMarkerServiceProvider.setPopupOffset(config.popupOffset);
        }])

    .config(['PostMessageServiceProvider', 'munimapConfig',
        function (PostMessageServiceProvider, munimapConfig) {
            const communicationConfig = munimapConfig.communication || {};

            PostMessageServiceProvider.setDefaultAllowedUrls(communicationConfig.allowedUrls);

            const plugins = communicationConfig.plugins || [];
            angular.forEach(plugins, function (config) {
                if (!angular.isString(config)) {
                    window.postMessagePlugins[config.name].allowedUrls = config.allowedUrls;
                }
            });
        }]);
