import { TOUCH as hasTouch } from 'ol/has';
import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';

angular.module('munimapBase.alkisOfficial', ['anol.map', 'munimapBase.alkisService'])
    .directive('alkisOfficial', ['$rootScope', '$q', '$compile', '$window', 'ControlsService', 
        'MapService', 'LayersService', 'AlkisService', '$uibModal',
        function($rootScope, $q, $compile, $window, ControlsService, MapService, 
            LayersService, AlkisService, $uibModal) {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    legimationModal: '=?',
                    tooltipPlacement: '@',
                    tooltipDelay: '@',
                    tooltipEnable: '@',
                    activate: '=?',
                    deactivate: '=?',
                    activatedCallback: '=?',
                    deactivatedCallback: '=?',
                    waitingMarkerSrc: '@?',
                    waitingMarkerOffset: '=?',
                    url: '@'
                },
                templateUrl: function(elem, attrs) {
                    return attrs.templateUrl;
                },
                link: {
                    pre: function(scope, element) {
                        scope.legimationModal = angular.isDefined(scope.legimationModal) ?
                            scope.legimationModal : false;                          
                        scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                            scope.tooltipPlacement : 'right';
                        scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                            scope.tooltipDelay : 500;
                        scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                            scope.tooltipEnable : !hasTouch;
                        
                        $rootScope.alkisPrintPreviewCenter = undefined;
                        $rootScope.popup = undefined;
                        scope.popupUrl = undefined;
                        
                        const defaultStyle = new Style({
                            fill: new Fill({
                                color: 'rgba(255, 255, 255, 0.4)'
                            }),
                            stroke: new Stroke({
                                color: 'rgba(255, 0, 0, 1)',
                                width: 2,
                                lineDash: [.1, 5],
                            })
                        });

                        // eslint-disable-next-line no-undef
                        scope.printInfoLayer = new anol.layer.Feature({
                            name: 'printOfficalInfoLayer',
                            displayInLayerswitcher: false,
                            olLayer: {
                                zIndex: 2003,
                            },
                        });
                        scope.printInfoLayer.olLayer = LayersService.createOlLayer(
                            scope.printInfoLayer
                        );
                        LayersService.addOverlayLayer(scope.printInfoLayer);
                        scope.printBboxString = undefined;
                        $window.addEventListener('message', function(e) {
                            if (!$rootScope.popup || $rootScope.popup.closed) {
                                // no popup present
                                return;
                            }
                            const popupUrl = scope.popupUrl;
                            if (e.data.action) {
                                // not an ALKIS message, but a message for the PostMessageService
                                return;
                            }
                            // strip fragment and query from url
                            let origin = popupUrl.split("#", 1)[0].split('?',1)[0];
                            // check for path '/' in url (after 'https://')
                            const indexOfPath = origin.indexOf('/',8);
                            if (indexOfPath !== -1) {
                                origin = origin.substring(0, indexOfPath);
                            }
                            if (e.origin !== origin) {
                                return;
                            }
                            if (e.data.close) {
                                scope.printInfoLayer.clear();
                            } else {
                                const printScale = parseInt(e.data.Masstab);
                                const printHeight = parseFloat(e.data.breithoch.split(';')[1]);
                                const printWidth = parseFloat(e.data.breithoch.split(';')[0]);
                                scope.createPrintArea(printWidth, printHeight, printScale);
                                if (angular.isDefined(scope.printBboxString)) {
                                    if (angular.isDefined($rootScope.popup)) {
                                        $rootScope.popup.postMessage(
                                            {'bbox': scope.printBboxString},
                                            scope.popupUrl
                                        );
                                    }
                                }
                            }
                        });

                        scope.createPrintArea = function(width, height, scale) {
                            const currentPageSize = [width, height, scale];
                            const mapWidth = currentPageSize[0];
                            const mapHeight = currentPageSize[1];
                            const center = $rootScope.alkisPrintPreviewCenter;
                            const top = center[1] + (mapHeight / 2);
                            const bottom = center[1] - (mapHeight / 2);
                            const left = center[0] - (mapWidth / 2);
                            const right = center[0] + (mapWidth / 2);
                            scope.printBboxString = left +',' + bottom+';' + right +','+ top; 
                            scope.updatePrintArea(left, top, right, bottom);
                        };

                        scope.updatePrintArea = function(left, top, right, bottom) {
                            scope.printInfoLayer.clear();
                            var coords = [[
                                [left, top],
                                [right, top],
                                [right, bottom],
                                [left, bottom],
                                [left, top]
                            ]];
                            let printArea = new Feature(new Polygon(coords));
                            printArea.setStyle(defaultStyle);
                            scope.printInfoLayer.addFeature(printArea);
                        };

                        const url = angular.isDefined(scope.url) ? scope.url : undefined;
                        scope.map = MapService.getMap();
                        if(angular.isDefined(scope.waitingMarkerSrc)) {
                            scope.waitingOverlayElement = element.find('#alkis-waiting-overlay');
                            $compile(scope.waitingOverlayElement)(scope);
                            scope.waitingOverlay = new Overlay({
                                element: scope.waitingOverlayElement[0],
                                position: undefined,
                                offset: scope.waitingMarkerOffset
                            });
                            scope.map.addOverlay(scope.waitingOverlay);
                        }

                        const handleFeatureinfoResponses = function(objects) {
                            angular.forEach(objects, function(object) {
                                scope.popupUrl = object['response']['url'];
                                const loc = $window.location;
                                const appUrl = loc.origin + loc.pathname;
                                $rootScope.popup = $window.open(object['response']['url']+'#'+appUrl, 'alkis',
                                    'toolbar=no,location=no, status=no, menubar=no, '+
                                     'scrollbars=yes, resizable=yes, width=500, height=600, alwaysOnTop=yes, _top');
                            });
                            scope.hideWaitingOverlay();
                        };

                        scope.handleClick = function(evt) {
                            // dont't open popup again if print info is shown
                            if (scope.printInfoLayer.getFeatures().length >= 1) {
                                if ($rootScope.popup && !$rootScope.popup.closed) {
                                    return;
                                } else {
                                    scope.printInfoLayer.clear();
                                }
                            }

                            const requestPromises = [];
                            const requestsDeferred = $q.defer();
                            requestsDeferred.promise.then(function() {
                                $q.all(requestPromises).then(handleFeatureinfoResponses);
                            });

                            if(angular.isDefined(url)) {
                                const coordinate = evt.coordinate;
                                $rootScope.alkisPrintPreviewCenter = coordinate;
                                scope.showWaitingOverlay(coordinate);

                                const requestDeferred = $q.defer();
                                requestPromises.push(requestDeferred.promise);
                                AlkisService.getAlkisInfos(url, evt).then(
                                    function(response) {
                                        if (response.data && response.data.success) { 
                                            requestDeferred.resolve({
                                                response: response.data
                                            });
                                        }
                                    }
                                );
                            }
                            requestsDeferred.resolve();
                            // scope.deactivate();
                        };

                        scope.legitimateInterestModal = function(control) {
                            $uibModal.open({
                                animation: false,
                                templateUrl: 'loadLegitimateInterestModal.html',
                                size: 'md',
                                controller: 'getAlkisLegitmationController',
                                windowClass: 'middle',
                                backdrop: 'static',
                            }).result.then(function(data){
                                if (data == 'success') {
                                    scope.handlerKey = scope.map.on('singleclick', scope.handleClick, this);
                                }
                            }, function(){
                                control.deactivate();
                            });
                        };   

                        scope.hideWaitingOverlay = function() {
                            if(angular.isDefined(scope.waitingMarkerSrc)) {
                                scope.waitingOverlay.setPosition(undefined);
                            }
                        };

                        scope.showWaitingOverlay = function(coordinate) {
                            if(angular.isDefined(scope.waitingMarkerSrc)) {
                                scope.waitingOverlay.setPosition(coordinate);
                            }
                        };                        
                    },
                    post: function(scope) {
                        // eslint-disable-next-line no-undef
                        const control = new anol.control.Control({
                            exclusive: true,
                            keepMenuOpen: true,
                            olControl: null
                        });
                        control.onDeactivate(function() {
                            unByKey(scope.handlerKey);
                            scope.printInfoLayer.clear();
                        });
                        control.onActivate(function() {
                            if (scope.legimationModal) {
                                scope.legitimateInterestModal(control);
                            } else {
                                scope.handlerKey = scope.map.on('singleclick', scope.handleClick, this);
                            }
                        });
                        scope.deactivate = function() {
                            control.deactivate();
                        };
                        scope.activate = function() {
                            control.activate();
                        };
                        scope.isActive = function() {
                            if (control.active) {
                                return true;
                            }
                            return false;
                        };
                        
                        scope.toggle = function() {
                            if (control.active) {
                                control.deactivate();
                            } else {
                                control.activate();
                            }
                        };
                        ControlsService.addControl(control);
                    }
                }

            };
        }]);
