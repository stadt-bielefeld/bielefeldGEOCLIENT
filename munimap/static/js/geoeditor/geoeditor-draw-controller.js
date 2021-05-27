import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';

angular.module('munimapGeoeditor')
    .controller('geoeditorDrawController', ['$scope', '$rootScope', 'GeoeditorValidationService', 'PostMessageService', 'DrawService', 'MapService', 'munimapConfig', 'DefaultStyle', 'PrintPageService', 'LayersService', 'PrintService',
        function ($scope, $rootScope, GeoeditorValidationService, PostMessageService, DrawService, MapService, munimapConfig, DefaultStyle, PrintPageService, LayersService, PrintService) {

            const geoeditorConfig = munimapConfig.components.geoeditor;
            const allowedUrls = geoeditorConfig.allowedUrls;

            const missingFeaturesText = 'Some feature types are missing.';
            const invalidFeaturesText = 'Some features are invalid.'

            PostMessageService.registerHandler('finishGeoEditing', allowedUrls, function (val, env, callback) {
                const validationStatus = GeoeditorValidationService.validate();

                if (validationStatus.hasMissingFeatures) {
                    callback({
                        action: 'finishGeoEditing_response',
                        value: {
                            message: missingFeaturesText,
                            missing: validationStatus.missingFeatures,
                            success: false
                        }
                    });
                } else if (!validationStatus.allFeaturesValid) {
                    callback({
                        action: 'finishGeoEditing_response',
                        value: {
                            message: invalidFeaturesText,
                            success: false
                        }
                    });
                } else {
                    const dataProjection = val.srs || 'EPSG:4326';

                    const geoJSONFormat = new GeoJSON({
                        featureProjection: MapService.getMap().getView().getProjection(),
                        dataProjection: dataProjection
                    });

                    const geoJSON = geoJSONFormat.writeFeaturesObject(DrawService.activeLayer.getFeatures());

                    callback({
                        action: 'finishGeoEditing_response',
                        value: {
                            success: true,
                            geoJSON: geoJSON
                        }
                    });
                }
            });

            PostMessageService.registerHandler('printGeoEditing', allowedUrls, function(val, env, callback) {
                const validationStatus = GeoeditorValidationService.validate();
                const requestedLayout = val.layout || 'a4-portrait';
                const requestedMargin = angular.isDefined(val.margin) ? val.margin : 20;
                const requestedOutputFormat = val.outputFormat || 'pdf';
                const minScale = val.minScale || 100;

                if (validationStatus.hasMissingFeatures || !validationStatus.allFeaturesValid) {
                    callback({
                        action: 'printGeoEditing_response',
                        value: {
                            success: false,
                            message: validationStatus.hasMissingFeatures ? missingFeaturesText : featuresInvalidText
                        }
                    });

                    return;
                }

                var extent = DrawService.activeLayer.olLayer.getSource().getExtent();
                var pageLayout = PrintPageService.pageLayouts.find(function(layout){
                    return layout.layout === requestedLayout;
                });
                if (!pageLayout) {
                    var validLayouts = PrintPageService.pageLayouts.map(function(layout) {
                        return layout.layout;
                    }).join(', ');
                    callback({
                        action: 'printGeoEditing_response',
                        value: {
                            success: false,
                            message: 'Unsupported layout: ' + requestedLayout + '. Valid layouts are: ' + validLayouts
                        }
                    });
                    return;
                }

                var mapSizeOnPage = pageLayout.mapSize;
                var scale = Math.max(
                  PrintPageService.getScaleFromExtent(extent, mapSizeOnPage, requestedMargin), minScale);
                var center = getCenter(extent);
                var bbox = PrintPageService.getBoundsForCenterMapSizeScale(center, mapSizeOnPage, scale);
                var outputFormat = PrintPageService.outputFormats.find(function(outputFormat) {
                    return outputFormat.value === requestedOutputFormat;
                });

                if (!outputFormat) {
                    var validFormats = PrintPageService.outputFormats.map(function (format) {
                        return format.value;
                    }).join(', ');
                    callback({
                        action: 'printGeoEditing_response',
                        value: {
                            success: false,
                            message: 'Unsupported output format: ' + requestedOutputFormat + '. Valid formats are: ' + validFormats
                        }
                    });
                    return;
                }

                var layers = [LayersService.activeBackgroundLayer()];
                layers.push(DrawService.activeLayer);

                var downloadPromise = PrintService.startPrint({
                    printMode: 'trigger',
                    bbox: bbox,
                    projection: MapService.getMap().getView().getProjection().getCode(),
                    layers: layers,
                    templateValues: {
                        layout: pageLayout.layout,
                        scale: scale,
                        pageSize: PrintPageService.mapToPageSize(mapSizeOnPage),
                        outputFormat: outputFormat
                    }
                });

                downloadPromise.then(
                    function(response) {
                        callback({
                            action: 'printGeoEditing_response',
                            value: {
                                success: true,
                                statusURL: response.statusURL,
                                downloadUrl: response.downloadURL
                            }
                        });
                    },
                    function(reason) {
                        callback({
                            action: 'printGeoEditing_response',
                            value: {
                                success: false,
                                message: 'The print failed. Server reason: ' + reason
                            }
                        });
                    }
                );
            });

            $scope.$parent.$parent.openGeoeditorPopup = function (layer, feature) {
                if (angular.isUndefined(feature.get('style'))) {
                    var style = angular.copy(DefaultStyle);
                    var styleConfig = geoeditorConfig.style;
                    var featureType = feature.getGeometry().getType();

                    var type = {
                        'Point': 'point',
                        'LineString': 'line',
                        'Polygon': 'polygon'
                    }[featureType];

                    if (styleConfig && styleConfig[type]) {
                        style = angular.merge(style, styleConfig[type]);
                    }

                    feature.set('style', style);
                }

                $rootScope.$broadcast('geoeditor:openPopupFor', layer, feature);
            };

            $scope.$parent.$parent.onDelete = function (layer, feature) {
                GeoeditorValidationService.updateFeatureValidationStatus(feature);
            };

            $scope.$parent.$parent.onModifySelect = function () {
                $rootScope.$broadcast('geoeditor:closePopup');
            }
        }]);
