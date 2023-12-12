require('angular-ui-bootstrap');
require('bootstrap-tour');
import 'spectrum-colorpicker/spectrum';
import 'spectrum-colorpicker/i18n/jquery.spectrum-de';

import {TOUCH as hasTouch} from 'ol/has';
import {transformExtent, transform} from 'ol/proj';

angular.module('munimapBase')
    .controller('baseController', ['$rootScope', '$scope', '$window', '$timeout', '$translate', '$location', '$uibModal',
        'munimapConfig', 'ControlsService', 'MapService', 'NotificationService', 'DrawService', 'ClusterSelectService',
        'Tour', 'SaveSettingsService', 'GeocoderService', 'CatalogService', 'PostMessageService', 'ReadyService',
        function($rootScope, $scope, $window, $timeout, $translate, $location, $uibModal, munimapConfig, ControlsService,
                 MapService, NotificationService, DrawService, ClusterSelectService, Tour, SaveSettingsService,
                 GeocoderService, CatalogService, PostMessageService, ReadyService) {

            $scope.printEnabled = munimapConfig.components.print === true;
            $scope.searchEnabled = munimapConfig.components.search === true;
            $scope.legendEnabled = munimapConfig.components.legend === true;
            $scope.layerswitcherEnabled = munimapConfig.components.layerswitcher === true;
            $scope.geolocationEnabled = munimapConfig.components.geolocation === true;
            $scope.scaleLineEnabled = munimapConfig.components.scaleLine === true;
            $scope.scaleTextEnabled = munimapConfig.components.scaleText === true;
            $scope.saveSettingsEnabled = munimapConfig.components.saveSettings === true;
            $scope.overviewMapEnabled = munimapConfig.components.overviewmap === true;
            $scope.serviceButtonEnabled = munimapConfig.components.serviceButton === true;
            $scope.alkisButtonEnabled = munimapConfig.components.alkis === true;
            $scope.searchDropdown = munimapConfig.components.searchDropdown === true;

            $scope.disableFeatureInfo = munimapConfig.app.disableFeatureInfo === true;

            if (munimapConfig.components.alkis) {
                if (Object.keys(munimapConfig.components.alkis).length > 0) {
                    Object.keys(munimapConfig.components.alkis).forEach(function(key) {
                        if (munimapConfig.components.alkis[key]) {
                            $scope.alkisButtonEnabled = true;
                        }
                    });
                }
            }
            $scope.homeButtonEnabled = munimapConfig.components.homeButton === true;
            $scope.menuButtonEnabled = munimapConfig.components.menuButton === true;
            $scope.measureLabelSegmentsEnabled = munimapConfig.components.measureLabelSegments === true;
            $scope.drawEnabled = munimapConfig.components.draw === true;
            $scope.geoeditorEnabled = munimapConfig.components.geoeditor === true;

            if ($scope.geoeditorEnabled) {
                $scope.geoeditorConfig = munimapConfig.geoeditor;
            }

            if ($scope.drawEnabled && $scope.geoeditorEnabled) {
                // anol-draw does not support multiple instances. This causes draw and geoeditor to work on the same layer.
                $scope.applicationError = 'The options draw and geoeditor cannot be enabled at the same time.';
            }

            $scope.catalogEnabled = munimapConfig.components.catalog === true;
            $scope.catalogVariant = 'abstract';
            $scope.catalogEnabledLayer = false;
            $scope.removeLayerEnabled = false;

            if (munimapConfig.components.catalog) {
                $scope.catalogEnabled = true;
                $scope.removeLayerEnabled = true;
                if (Object.keys(munimapConfig.components.catalog).length > 0) {
                    Object.keys(munimapConfig.components.catalog).forEach(function(key) {
                        if (key === 'layer') {
                            $scope.catalogEnabledLayer = munimapConfig.components.catalog[key];
                        }
                        if (key === 'variant') {
                            $scope.catalogVariant = munimapConfig.components.catalog[key];
                        }
                    });
                }
            }

            CatalogService.setVariant($scope.catalogVariant);
            $scope.hideMetadata = munimapConfig.app.hideMetadata == true;

            if($scope.drawEnabled === false && $scope.geoeditorEnabled === false) {
                DrawService.changeLayer(undefined);
                $scope.popupLayers = [];
                $scope.excludePopupLayers = [];
            } else {
                $scope.popupLayers = [DrawService.activeLayer];
                $scope.excludePopupLayers = [DrawService.activeLayer];
            }

            // load default sidebar config from config file
            if (munimapConfig.map.sidebar) {
                if ($location.search().sidebar == undefined) {
                    $location.search('sidebar', munimapConfig.map.sidebar);
                }
            }

            // assign positions for mobile buttons
            if(angular.isDefined(munimapConfig.componentPositions) && angular.isDefined(munimapConfig.componentPositions.mobile)) {
                $scope.mobileMenuButtonPosition = munimapConfig.componentPositions.mobile.menuButton || {};
                $scope.mobileZoomButtonsPosition = munimapConfig.componentPositions.mobile.zoomButtons || {};
                $scope.mobileGeolocationButtonPosition = munimapConfig.componentPositions.mobile.geolocationButton || {};
                $scope.mobileHomeButtonPosition = munimapConfig.componentPositions.mobile.homeButton || {};
                $scope.mobileRotationButtonPosition = munimapConfig.componentPositions.mobile.rotationButton || {};
                $scope.mobileServiceButtonPosition = munimapConfig.componentPositions.mobile.serviceButton || {};
                $scope.mobileServiceMenuPosition = munimapConfig.componentPositions.mobile.serviceMenu || {};
                $scope.mobilePointMeasureResultPosition = munimapConfig.componentPositions.mobile.pointMeasureResult || {};
                $scope.mobileEndMeasurePosition = munimapConfig.componentPositions.mobile.endMeasureButton || {};
            } else {
                $scope.mobileMenuButtonPosition = {};
                $scope.mobileZoomButtonsPosition = {};
                $scope.mobileGeolocationButtonPosition = {};
                $scope.mobileHomeButtonPosition = {};
                $scope.mobileRotationButtonPosition = {};
                $scope.mobileServiceButtonPosition = {};
                $scope.mobileServiceMenuPosition = {};
                $scope.mobilePointMeasureResultPosition = {};
                $scope.mobileEndMeasurePosition = {};
            }

            // assign positions for desktop buttons
            if(angular.isDefined(munimapConfig.componentPositions) && angular.isDefined(munimapConfig.componentPositions.desktop)) {
                $scope.desktopMenuButtonPosition = munimapConfig.componentPositions.desktop.menuButton || {};
                $scope.desktopZoomButtonsPosition = munimapConfig.componentPositions.desktop.zoomButtons || {};
                $scope.desktopGeolocationButtonPosition = munimapConfig.componentPositions.desktop.geolocationButton || {};
                $scope.desktopHomeButtonPosition = munimapConfig.componentPositions.desktop.homeButton || {};
                $scope.desktopRotationButtonPosition = munimapConfig.componentPositions.desktop.rotationButton || {};
                $scope.desktopServiceButtonPosition = munimapConfig.componentPositions.desktop.serviceButton || {};
                $scope.desktopServiceMenuPosition = munimapConfig.componentPositions.desktop.serviceMenu || {};
                $scope.desktopPointMeasureResultPosition = munimapConfig.componentPositions.desktop.pointMeasureResult || {};
                $scope.desktopEndMeasurePosition = munimapConfig.componentPositions.desktop.endMeasureButton || {};
            } else {
                $scope.desktopMenuButtonPosition = {};
                $scope.desktopZoomButtonsPosition = {};
                $scope.desktopGeolocationButtonPosition = {};
                $scope.desktopHomeButtonPosition = {};
                $scope.desktopRotationButtonPosition = {};
                $scope.desktopServiceButtonPosition = {};
                $scope.desktopServiceMenuPosition = {};
                $scope.desktopPointMeasureResultPosition = {};
                $scope.desktopEndMeasurePosition = {};
            }

            $scope.components = munimapConfig.components;

            $scope.printConfig = munimapConfig.printConfig;
            GeocoderService.addConfigs(munimapConfig.searchConfig);
            $scope.geolocationConfig = munimapConfig.geolocationConfig;
            $scope.tooltipDelay = munimapConfig.app.tooltipDelay;
            $scope.headerTitle = munimapConfig.app.title;
            $scope.headerLogoURL = munimapConfig.app.headerLogo;
            $scope.headerLogoLink= munimapConfig.app.headerLogoLink;
            $scope.hideLink = munimapConfig.app.hideLink;
            $scope.versionString = munimapConfig.app.versionString;

            // on devices with smaller width from 480 we hide the sidebar everytime
            let sidebarOpen = munimapConfig.app.sidebarOpen;
            let openItem = munimapConfig.map.sidebar;
            if ($window.innerWidth <= 480) {
                sidebarOpen = false;
            }

            $rootScope.sidebar = {
                open: sidebarOpen,
                openItems: openItem ? [openItem] : []
            };

            $scope.showTooltip = !(hasTouch);

            $scope.pointMeasureResultSrs = 'EPSG:25832';
            $rootScope.pointMeasureResultSrs = $scope.pointMeasureResultSrs;

            $scope.endMeasureAreaVisible = false;
            $scope.endMeasureLineVisible = false;

            $scope.hasTouch = MapService.hasTouch;

            $scope.deactivateDrawText = undefined;
            $scope.drawTextActive = false;
            $scope.drawTextDisabled = angular.isUndefined(DrawService.activeLayer);

            $scope.hasTour = Tour !== false;

            $scope.openPopupFor = undefined;
            $scope.openDrawPopupFor = undefined;

            $scope.featureInfoCallback = function() {
                $scope.showFeatureInfo = true;
            };

            $scope.featureInfoBeforeRequest = function() {
                $scope.showFeatureInfo = false;
            };

            $scope.legendCallback = function() {
                $('#legend-modal').modal('show');
            };

            $scope.toggleMenu = function() {
                $scope.sidebar.open = !$scope.sidebar.open;
            };

            $scope.goHome = function() {
                var map = MapService.getMap();
                if(angular.isDefined(munimapConfig.map.bbox)) {
                    var extent = transformExtent(
                        munimapConfig.map.bbox,
                        munimapConfig.map.bboxProjection || 'EPSG:4326',
                        map.getView().getProjection().getCode()
                    );
                    map.getView().fit(extent, map.getSize());
                } else {
                    map.getView().setCenter(transform(
                        munimapConfig.map.center || [0, 0],
                        munimapConfig.map.centerProjection || 'EPSG:4326',
                        map.getView().getProjection().getCode()
                    ));
                    map.getView().setZoom(munimapConfig.map.zoom);
                }
            };

            $scope.openCatalog = function() {
                $uibModal.open({
                    windowClass: 'catalog-modal',
                    animation: false,
                    templateUrl: 'catalogModalContent.html',
                    size: 'lg',
                    controller: 'catalogModalController',
                    resolve: {
                        ShowLayers: function() {
                            return $scope.catalogEnabledLayer;
                        },
                        Variant: function() {
                            return $scope.catalogVariant;
                        }
                    }
                }).result.then(function(){}, function(){});
            };

            $scope.openSaveSettingsModal = function() {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'saveSettingsModalContent.html',
                    size: 'md',
                    controller: 'saveSettingsModalController'
                }).result.then(function(){}, function(){});
                var toolsControlContainerScope = angular.element('.tools-control-container').scope();
                toolsControlContainerScope.toggle();
            };

            $scope.openLoadSettingsModal = function() {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'loadSettingsModalContent.html',
                    size: 'md',
                    controller: 'loadSettingsModalController'
                }).result.then(function(){}, function(){});
                var toolsControlContainerScope = angular.element('.tools-control-container').scope();
                toolsControlContainerScope.toggle();
            };

            $scope.$watch(function() {
                return CatalogService.getVariant();
            }, function() {
                $scope.catalogVariant = CatalogService.getVariant();
            }, true);


            $scope.$watch(function() {
                return $rootScope.pointMeasureResultSrs;
            }, function() {
                $scope.pointMeasureResultSrs = $rootScope.pointMeasureResultSrs;
            }, true);

            var formatPointMeasureResult = function() {
                $rootScope.pointMeasureResultSrs = $scope.pointMeasureResultSrs;
                var coord = transform(
                    $scope.originalPointMeasureResult,
                    MapService.getMap().getView().getProjection().getCode(),
                    $scope.pointMeasureResultSrs
                );
                var fixed = $scope.pointMeasureResultSrs === 'EPSG:4326' ? 5 : 2;
                var precision = Math.pow(10, fixed);

                // return coordinates reverted (google compatible)
                if($scope.pointMeasureResultSrs === 'EPSG:4326') {
                    return {
                        lon: (Math.round(coord[0] * precision) / precision).toFixed(fixed),
                        lat: (Math.round(coord[1] * precision) / precision).toFixed(fixed)
                    };
                }
                return {
                    lat: (Math.round(coord[0] * precision) / precision).toFixed(fixed),
                    lon: (Math.round(coord[1] * precision) / precision).toFixed(fixed)
                };
            };

            $scope.measureCallback = function(result) {
                if(result.type === 'point') {
                    $scope.originalPointMeasureResult = result.value;
                    $scope.pointMeasureResult = formatPointMeasureResult();
                    $scope.$apply(function() {
                        $scope.measurePointResultVisible = true;
                    });
                }
            };
            var pointActive, lineActive, areaActive;
            $scope.onPointMeasureActivated = function() {
                pointActive = true;
                MapService.getMap().getTarget().style.cursor = 'crosshair';
            };
            $scope.onPointMeasureDeactivated = function() {
                $scope.measurePointResultVisible = false;
                pointActive = false;
                if(!pointActive && !lineActive && !areaActive) {
                    MapService.getMap().getTarget().style.cursor = '';
                }
            };

            $scope.onLineMeasureActivated = function() {
                $scope.endMeasureLineVisible = true;
                lineActive = true;
                MapService.getMap().getTarget().style.cursor = 'crosshair';
            };
            $scope.onLineMeasureDeactivated = function() {
                lineActive = false;
                if(!pointActive && !lineActive && !areaActive) {
                    MapService.getMap().getTarget().style.cursor = '';
                }
                if(!lineActive && !areaActive) {
                    $scope.endMeasureLineVisible = false;
                }
            };

            $scope.onAreaMeasureActivated = function() {
                $scope.endMeasureAreaVisible = true;
                areaActive = true;
                MapService.getMap().getTarget().style.cursor = 'crosshair';
            };
            $scope.onAreaMeasureDeactivated = function() {
                areaActive = false;
                if(!pointActive && !lineActive && !areaActive) {
                    MapService.getMap().getTarget().style.cursor = '';
                }
                if(!lineActive && !areaActive) {
                    $scope.endMeasureAreaVisible = false;
                }
            };

            // $scope.endMeasure = function() {
            // // defined in map service button
            //     if(angular.isFunction($scope.deactivateLineMeasure)) {
            //         $scope.deactivateLineMeasure();
            //     }
            //     if(angular.isFunction($scope.deactivateAreaMeasure)) {
            //         $scope.deactivateAreaMeasure();
            //     }
            //     // defined in sidebar footer
            //     if(angular.isFunction($scope.deactivateSidebarLineMeasure)) {
            //         $scope.deactivateSidebarLineMeasure();
            //     }
            //     if(angular.isFunction($scope.deactivateSidebarAreaMeasure)) {
            //         $scope.deactivateSidebarAreaMeasure();
            //     }
            // };

            $scope.textDrawn = function(layer, feature) {
                $scope.drawTextActive = false;
                $scope.deactivateDrawText = undefined;
                feature.set('isText', true);
                feature.set('style', {
                    'radius': 0
                });
            };

            $scope.drawText = function(createDrawFunc) {
                if($scope.deactivateDrawText === undefined) {
                    $scope.deactivateDrawText = createDrawFunc('Point', $scope.textDrawn);
                } else {
                    $scope.deactivateDrawText();
                    $scope.deactivateDrawText = undefined;
                }
                $scope.drawTextActive = $scope.deactivateDrawText !== undefined;
            };

            $scope.$watch('pointMeasureResultSrs', function(n) {
                if($scope.measurePointResultVisible) {
                    $scope.pointMeasureResult = formatPointMeasureResult();
                }
            });

            $scope.$on('anol.geolocation', function(event, args) {
                if(args.message !== undefined) {
                    NotificationService.add(args.message, args.type);
                }
            });

            $scope.openDrawPopup = function(layer, feature) {
                $scope.openDrawPopupFor = {'layer': layer, 'feature': feature};
            };

            $scope.drawPopupClosed = function() {
                $('.munimap-digitize-popup')
                    .find('[ng-init^=defaultSpectrumOptions]')
                    .find('input')
                    .spectrum('hide');
            };

            $scope.removeFeature = function(popup, anolLayer, feature) {
                anolLayer.olLayer.getSource().removeFeature(feature);
                popup.close();
            };

            $scope.preDownload = function(featureCollection) {
                angular.forEach(featureCollection.features, function(feature) {
                    if(angular.isUndefined(feature.properties.style)) {
                        return;
                    }
                    var featureStyle = feature.properties.style;
                    var style;
                    // atm icon style is not included in draw functionality
                    // add here also when added
                    switch(feature.geometry.type) {
                    case 'LineString':
                        style = angular.extend({}, {
                            strokeWidth: featureStyle.strokeWidth,
                            strokeColor: featureStyle.strokeColor,
                            strokeOpacity: featureStyle.strokeOpacity,
                            strokeDashstyle: featureStyle.strokeDashstyle
                        });
                        break;
                    case 'Polygon':
                        style = angular.extend({}, {
                            strokeWidth: featureStyle.strokeWidth,
                            strokeColor: featureStyle.strokeColor,
                            strokeOpacity: featureStyle.strokeOpacity,
                            strokeDashstyle: featureStyle.strokeDashstyle,
                            fillColor: featureStyle.fillColor,
                            fillOpacity: featureStyle.fillOpacity
                        });
                        break;
                    case 'Point':
                        // see $scope.textDrawn
                        if(featureStyle.externalGraphic !== undefined) {
                            style = angular.extend({}, {
                                externalGraphic: featureStyle.externalGraphic,
                                graphicXAnchor: featureStyle.graphicXAnchor,
                                graphicYAnchor: featureStyle.graphicYAnchor,
                                graphicWidth: featureStyle.graphicWidth,
                                graphicHeight: featureStyle.graphicHeight,
                                graphicRotation: featureStyle.graphicRotation
                            });
                        } else if(featureStyle.radius !== 0) {
                            style = angular.extend({}, {
                                strokeWidth: featureStyle.strokeWidth,
                                strokeColor: featureStyle.strokeColor,
                                strokeOpacity: featureStyle.strokeOpacity,
                                strokeDashstyle: featureStyle.strokeDashstyle,
                                fillColor: featureStyle.fillColor,
                                fillOpacity: featureStyle.fillOpacity,
                                radius: featureStyle.radius
                            });
                        } else {
                            style = angular.extend({}, {
                                text: featureStyle.text,
                                fontWeight: featureStyle.fontWeight,
                                fontSize: featureStyle.fontSize,
                                fontColor: featureStyle.fontColor,
                                fontRotation: featureStyle.fontRotation
                            });
                        }
                        break;
                    default:
                        style = {};
                    }
                    feature.properties.style = style;
                });
                return featureCollection;
            };

            $scope.propsToFormValues = function(featureCollection) {
                featureCollection.features.forEach(feature => {
                    const {
                        style,
                        ...formValues
                    } = feature.properties;
                    feature.properties = {style};
                    if (Object.keys(formValues).length > 0) {
                        feature.properties.formValues = formValues;
                    }
                });
                return featureCollection;
            };

            $scope.removeAllFeatures = (layer) => {
                layer.clear();
            };

            $scope.restartTour = function() {
                if(Tour === false) {
                    return;
                }
                var toolsControlContainerScope = angular.element('.tools-control-container').scope();
                toolsControlContainerScope.toggle();
                Tour.restart();
            };

            ClusterSelectService.registerSelectRevealedFeatureCallback(function(revealedFeature, originalFeature, layer) {
                $scope.$apply(function() {
                    $scope.openPopupFor = {
                        feature: originalFeature,
                        layer: layer,
                        coordinate: revealedFeature.getGeometry().getCoordinates()
                    };
                });
            });

            var initAdditionalMapElements = function() {
                var menuControlElement = angular.element('.menu-control');
                if(menuControlElement.length > 0) {
                    var menuControl = new anol.control.Control({
                        element: menuControlElement
                    });
                    ControlsService.addControl(menuControl);
                }
                var homeControlElement = angular.element('.home-control');
                if(homeControlElement.length > 0) {
                    var homeControl = new anol.control.Control({
                        element: homeControlElement
                    });
                    ControlsService.addControl(homeControl);
                }
                var toolsControlElement = angular.element('.tools-control');
                var toolsContainerControlElement = angular.element('.tools-container-control');
                if(toolsControlElement.length > 0 && toolsContainerControlElement.length > 0) {
                    var toolsControl = new anol.control.Control({
                        element: toolsControlElement
                    });
                    ControlsService.addControl(toolsControl);
                    var toolsContainerControl = new anol.control.Control({
                        element: toolsContainerControlElement
                    });
                    ControlsService.addControl(toolsContainerControl);
                }

                /** if we don´t add this as control the eventPropagation is no longer handled by openlayers.
                * so we can rightclick on this element to get the default contextmenu. this is useful to copy the coordinates.
                var measurePointResultElement = angular.element('.measure-point-result');
                if(measurePointResultElement.length > 0) {
                    var measurePointResultControl = new anol.control.Control({
                        element: measurePointResultElement
                    });
                    ControlsService.addControl(measurePointResultControl);
                } */

                var endMeasureElement = angular.element('.end-measure');
                if(endMeasureElement.length > 0) {
                    var endMeasureControl = new anol.control.Control({
                        element: endMeasureElement
                    });
                    ControlsService.addControl(endMeasureControl);
                }

                var mapLogoElement = angular.element('.map-logo');
                if(mapLogoElement.length > 0) {
                    var mapLogoControl = new anol.control.Control({
                        element: mapLogoElement
                    });
                    ControlsService.addControl(mapLogoControl);
                    $scope.$watch('sidebar.open', function(isOpen) {
                        if(isOpen) {
                            mapLogoElement.hide();
                        } else {
                            mapLogoElement.show();
                        }
                    });
                }

                if(Tour !== false) {
                    Tour.init();
                    $timeout(function() {
                        Tour.start();
                    });
                }

                if (typeof contextmenuItems !== 'undefined') {
                    if (angular.isDefined(contextmenuItems)) {
                        var contextmenu = new anol.control.ContextMenu({
                            width: 180,
                            items: contextmenuItems
                        });
                        var map = MapService.getMap();
                        map.addControl(contextmenu);
                        contextmenu.enable();
                    }
                }
            };

            ReadyService.waitFor('translation');

            $translate.onReady(function() {
                ReadyService.notifyAboutReady('translation')
            });

            // some additional map elements like 'homeButton' are wrapped in ng-if
            // so it will be visible (or not) after first digit cycle is completed
            $timeout(initAdditionalMapElements);
            if (typeof selectedSettings !== 'undefined') {
                $timeout(function() {
                    if (selectedSettings && Object.keys(selectedSettings).length !== 0) {
                        SaveSettingsService.applyLoadSettings(selectedSettings);
                    }
                });
            }

            $rootScope.$watch('geocodeFailed', () => {
                if ($rootScope.geocodeFailed) {
                    let message = 'Der übergebene Parameter konnte nicht gefunden werden.';
                    const msgConfig = munimapConfig.urlGeocodeNotFoundMessage
                    if (msgConfig !== false) {
                        if (angular.isString(msgConfig)) {
                            message = msgConfig;
                        }
                        NotificationService.addError(message, { timeout: 8000 });
                    }

                    console.error(message);
                }
            });
        }]);
