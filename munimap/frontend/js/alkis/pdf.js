import { unByKey } from 'ol/Observable.js';
import Overlay from 'ol/Overlay';

angular.module('munimapBase.alkisPdf', ['anol.map', 'munimapBase.alkisService'])
    .directive('alkisPdf', ['$q', '$compile', '$window', 'ControlsService', 'MapService', 'AlkisService', '$uibModal',
        function($q, $compile, $window, ControlsService, MapService, AlkisService, $uibModal) {
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
                            scope.tooltipEnable : !('ontouchstart' in window);

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
                                $window.open(object['response']['url'], 'alkis',
                                    'toolbar=no,location=no, status=no, menubar=no, '+
                                     'scrollbars=yes, resizable=yes, width=500, height=600, alwaysOnTop=yes, _top');
                            });
                            scope.hideWaitingOverlay();
                        };
                        scope.handleClick = function(evt) {
                            const requestPromises = [];
                            const requestsDeferred = $q.defer();
                            requestsDeferred.promise.then(function() {
                                $q.all(requestPromises).then(handleFeatureinfoResponses);
                            });

                            if(angular.isDefined(url)) {
                                const coordinate = evt.coordinate;
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

