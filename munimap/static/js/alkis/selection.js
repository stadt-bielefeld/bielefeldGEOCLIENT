require('ngstorage');

import { TOUCH as hasTouch } from 'ol/has';
import { unByKey } from 'ol/Observable.js';
import { getCenter } from 'ol/extent';

angular.module('munimapBase.alkisSelection', ['anol.map', 'ngStorage'])
    .config(['$sessionStorageProvider',
        function ($sessionStorageProvider) {
            $sessionStorageProvider.setKeyPrefix('alkis-');
        }])

    .controller('getAlkisSelectionController',
        ['alkisStorage', '$rootScope', '$scope', '$q', '$http', '$uibModalInstance', 'AlkisSelectionUrl', 'LayersService',
            function(alkisStorage, $rootScope, $scope, $q, $http, $uibModalInstance, AlkisSelectionUrl, LayersService) {
                let vm = $scope;
                vm.close = function() {
                    $uibModalInstance.dismiss();
                    if ($rootScope.featureLayer) {
                        LayersService.removeSystemLayer($rootScope.featureLayer);
                    }
                };

                let updateFromServer = true;
                if (alkisStorage.updateDate) {
                    const lastUpdate = new Date(alkisStorage.updateDate);
                    const currentDate = new Date();
                    const hours = Math.abs(currentDate - lastUpdate) / 36e5;
                    if (hours < 24)  {
                        updateFromServer = false;
                    }
                }
                if (!updateFromServer &&
                  (!angular.equals({}, alkisStorage.gemarkungen) && !angular.equals({}, alkisStorage.strassen))) {
                    vm.gemarkungen = alkisStorage.gemarkungen;
                    vm.strassen = alkisStorage.strassen;
                } else {
                    alkisStorage.gemarkungen = {};
                    alkisStorage.strassen = {};
                    updateFromServer = true;
                }

                const requestPromises = [];
                const requestDeferred = $q.defer();
                requestPromises.push(requestDeferred.promise);

                if(updateFromServer) {
                    $http.get(AlkisSelectionUrl).then(
                        function(response) {
                            vm.strassen = response.data['strassen'];
                            vm.gemarkungen = response.data['gemarkungen'];
                            // update session storage
                            let updateDate = new Date();
                            alkisStorage.updateDate = updateDate.toJSON();
                            alkisStorage.gemarkungen = vm.gemarkungen;
                            alkisStorage.strassen = vm.strassen;
                        }
                    );
                }
                requestDeferred.resolve();

                vm.registerCallBack = function(){
                    vm.close();
                };
            }
        ])

    .directive('alkisSelection', ['$uibModal', '$sessionStorage', 'ControlsService', 'MapService',
        function($uibModal, $sessionStorage, ControlsService, MapService) {
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
                    url: '@',
                },
                templateUrl: function(elem, attrs) {
                    return attrs.templateUrl;
                },
                link: {
                    pre: function(scope) {
                        scope.legimationModal = angular.isDefined(scope.legimationModal) ?
                            scope.legimationModal : false;
                        scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                            scope.tooltipPlacement : 'right';
                        scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                            scope.tooltipDelay : 500;
                        scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                            scope.tooltipEnable : !hasTouch;

                        scope.$alkisStorage = $sessionStorage;

                        scope.map = MapService.getMap();
                        scope.handleClick = function() {
                            $uibModal.open({
                                animation: false,
                                templateUrl: 'loadAlkisSelection.html',
                                size: 'md',
                                windowClass: 'left active-background',
                                controller: 'getAlkisSelectionController',
                                backdrop: false,
                                resolve: {
                                    alkisStorage: function() {
                                        return scope.$alkisStorage;
                                    },
                                }
                            }).result.then(function(){}, function(){});

                            var toolsControlContainerScope = angular.element('.tools-control-container').scope();
                            toolsControlContainerScope.toolsContainerVisible = false;

                            scope.deactivate();
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
                                    scope.handleClick();
                                }
                            }, function(){
                                control.deactivate();
                            });
                        };
                    },
                    post: function(scope) {
                        // eslint-disable-next-line no-undef
                        const control = new anol.control.Control({
                            exclusive: true,
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
                            if (!scope.legimationModal) {
                                scope.handleClick();
                            }
                        };
                        ControlsService.addControl(control);
                    }
                }
            };
        }])

    .directive('alkisSelectionContent', ['$rootScope',
        '$http', '$window', 'AlkisService', 'LayersService', 'MapService',
        'AlkisSelectionByParcelUrl', 'AlkisSelectionByOwnerUrl',
        'AlkisSelectionSearchOwnerUrl', 'AlkisSelectionByAddressUrl', 'AlkisWFSUrl',
        'AlkisWFSParameter', 'alkisLegimationService',
        function(
            $rootScope, $http, $window, AlkisService, LayersService, MapService,
            AlkisSelectionByParcelUrl, AlkisSelectionByOwnerUrl,
            AlkisSelectionSearchOwnerUrl, AlkisSelectionByAddressUrl, AlkisWFSUrl,
            AlkisWFSParameter, alkisLegimationService) {
            return {
                restrict: 'A',
                templateUrl: function(elem, attrs) {
                    return attrs.templateUrl;
                },
                scope: {
                    modalCallBack: '&',
                    gemarkungen: '=',
                    strassen: '=',
                },
                link: function(scope) {
                    scope.map = MapService.getMap();
                    scope.featureLayer = undefined;

                    scope.$watch('strassen', function(n) {
                        if (angular.isDefined(n)) {
                            scope.loading = false;
                        } else {
                            scope.loading = true;
                        }
                    });

                    scope.plot = {
                        district: '-Keine Auswahl-',
                        flur: undefined,
                        plotName: undefined
                    };
                    var plotDefault = {};
                    angular.copy(scope.plot, plotDefault);

                    scope.owner = {
                        firstname: undefined,
                        name: undefined,
                        component: undefined
                    };

                    var ownerDefault = {};
                    angular.copy(scope.owner, ownerDefault);

                    scope.address = {
                        street: '-Keine Auswahl-',
                        housenumber: undefined,
                        additional: undefined
                    };

                    var addressDefault = {};
                    angular.copy(scope.address, addressDefault);

                    scope.responseData = {};
                    scope.ownerData = {};
                    scope.processPlotForm = function() {
                        scope.responseData = {};
                        scope.showWaitingOverlay();
                        AlkisService.getByAddress(
                            AlkisSelectionByParcelUrl, scope.plot).then(
                            function(response) {
                                scope.responseData = response.data;
                                scope.hideWaitingOverlay();
                            }
                        );
                    };

                    scope.processAddressForm = function() {
                        scope.responseData = {};
                        scope.showWaitingOverlay();
                        AlkisService.getByAddress(
                            AlkisSelectionByAddressUrl, scope.address).then(
                            function(response) {
                                scope.responseData = response.data;
                                scope.hideWaitingOverlay();
                            }
                        );
                    };

                    scope.searchByOwner = function(id) {
                        scope.showWaitingOverlay();
                        scope.responseData = {};
                        let legParams = alkisLegimationService.model;
                        legParams['id'] = id;
                        AlkisService.searchOwner(
                            AlkisSelectionByOwnerUrl, legParams).then(
                            function(response) {
                                scope.responseData = response.data;
                                scope.hideWaitingOverlay();
                            }
                        );
                    };

                    scope.processSearchOwnerForm = function() {
                        scope.showWaitingOverlay();
                        scope.responseData = {};
                        scope.ownerData = {};
                        let mergedParams = angular.merge(alkisLegimationService.model, scope.owner);
                        AlkisService.searchOwner(
                            AlkisSelectionSearchOwnerUrl, mergedParams).then(
                            function(response) {
                                scope.ownerData = response.data;
                                scope.ownerData.label = 'ownerdisplay';
                                scope.ownerData.identifier = 'alkisid';
                                scope.hideWaitingOverlay();
                            }
                        );
                    };

                    scope.requestPDFInfoPopup = function(url, feautre_id, alkis_id) {
                        let legParams = alkisLegimationService.model;
                        legParams['feature_id'] = feautre_id;
                        legParams['alkis_id'] = alkis_id;
                        $http.get(url,  {params: legParams})
                            .then(function(response) {
                                $window.open(response['data']['url'], '',
                                    'toolbar=no,location=no, status=no, menubar=no, '+
                                     'scrollbars=yes, resizable=yes, width=500, height=600');
                            });
                    };

                    scope.requestInfoPopup = function(url, id, alkToZoomTo) {
                        let legParams = alkisLegimationService.model;
                        if (alkToZoomTo) {
                            scope.showFeatureInMap(alkToZoomTo, undefined, undefined, false);
                            let source = scope.featureLayer.olLayer.getSource();
                            source.on('addfeature', function() {
                                LayersService.removeSystemLayer(scope.featureLayer);

                                let extent = source.getExtent();
                                let center = getCenter(extent);
                                $rootScope.alkisPrintPreviewCenter = center;

                                if (scope.map) {
                                    let view = scope.map.getView();
                                    let minZoom = view.getMinZoom();
                                    view.fit(extent, scope.map.getSize());
                                    let zoom = view.getZoom() - 2;
                                    if (zoom < minZoom) {
                                        zoom = minZoom;
                                    }
                                    view.setZoom(zoom);
                                }

                                $http.get(url + '/' + id,  {params: legParams})
                                    .then(function(response) {
                                        const loc = $window.location;
                                        const appUrl = loc.origin + loc.pathname;
                                        $rootScope.popupUrl = response['data']['url'];
                                        $rootScope.popup = $window.open(response['data']['url']+'#'+appUrl, '',
                                            'toolbar=no,location=no, status=no, menubar=no, '+
                                            'scrollbars=yes, resizable=yes, width=500, height=600');
                                    });
                            });
                        } else {
                            $http.get(url + '/' + id,  {params: legParams})
                                .then(function(response) {
                                    const loc = $window.location;
                                    const appUrl = loc.origin + loc.pathname;
                                    // $rootScope.popupUrl will only be used to share
                                    // the url between the selection and the official directive.
                                    $rootScope.popupUrl = response['data']['url'];
                                    $window.open(response['data']['url']+'#'+appUrl, '',
                                        'toolbar=no,location=no, status=no, menubar=no, '+
                                        'scrollbars=yes, resizable=yes, width=500, height=600');
                                });
                        }
                    };
                    scope.showAllFeatures = function() {
                        var ids = [];
                        angular.forEach(scope.responseData.items, function(items) {
                            ids.push(items['flurstuecksnummer_alk']);
                        });
                        scope.showFeatureInMap(ids, 'Or', 'POST');
                    };
                    scope.showFeatureInMap = function(literal, filterType, method, listenAddFeature=true) {
                        if (scope.featureLayer) {
                            LayersService.removeSystemLayer(scope.featureLayer);
                        }
                        if (angular.isUndefined(method)) {
                            method = 'GET';
                        }
                        // eslint-disable-next-line no-undef
                        scope.featureLayer = new anol.layer.GML({
                            name: 'alkis_feature_layer',
                            title: 'Feature Layer for ALKIS',
                            displayInLayerswitcher: false,
                            method: method,
                            olLayer: {
                                zIndex: 2001,
                                source: {
                                    url: AlkisWFSUrl,
                                    params: AlkisWFSParameter,
                                }
                            },
                            filter: {
                                literal: literal,
                                propertyName: 'infotext',
                                filterType: filterType
                            }
                        });
                        $rootScope.featureLayer = scope.featureLayer;
                        LayersService.addSystemLayer(scope.featureLayer);
                        var source = scope.featureLayer.olLayer.getSource();
                        if (listenAddFeature) {
                            source.on('addfeature', function() {
                                scope.map.getView().fit(source.getExtent(), scope.map.getSize());
                            });
                        }
                    };

                    scope.clearOwnerForm = function() {
                        angular.copy(ownerDefault, scope.owner);
                        scope.ownerData = {};
                        scope.responseData = {};
                    };

                    scope.clearAddressForm = function() {
                        angular.copy(addressDefault, scope.address);
                        scope.responseData = {};
                    };

                    scope.clearPlotForm = function() {
                        angular.copy(plotDefault, scope.plot);
                        scope.responseData = {};
                    };

                    scope.changeTab = function() {
                        scope.responseData = {};
                        scope.ownerData = {};
                    };

                    scope.preLoader = false;
                    scope.hideWaitingOverlay = function() {
                        scope.preLoader = false;
                    };

                    scope.showWaitingOverlay = function() {
                        scope.preLoader = true;
                    };
                }
            };
        }]);

