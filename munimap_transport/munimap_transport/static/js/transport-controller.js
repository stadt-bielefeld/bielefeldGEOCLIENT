import { isHoliday, isSunOrHoliday } from 'feiertagejs';

angular.module('munimapBase')
    .controller('transportController', ['$rootScope', '$timeout', '$scope', '$filter', 'LayersService', 'ControlsService', 'munimapConfig', 'stationLayerURL', 'stationPointLayerURL',
        function($rootScope, $timeout, $scope, $filter, LayersService, ControlsService, munimapConfig, stationLayerURL, stationPointLayerURL) {

            $scope.timetableEnabled = munimapConfig.components.timetable === true;
            $rootScope.timetableActive = false;

            if (!$scope.timetableEnabled) {
                return;
            }
            var stationsLayer = LayersService.layerByName('selectable_station_points');
            var stationPointLayer = LayersService.layerByName('selectable_stations');
            var routeLayer = LayersService.layerByName('display_routes');
            var constructionsLayer = LayersService.layerByName('baustellen');

            $scope.stationPopupLayers = [];
            $scope.constructionPopupLayers = [];
            if(angular.isDefined(constructionsLayer)) {
                $scope.constructionsLayer.push(constructionsLayer);
            }

            $scope.timetableInformation  = {
                'destination': undefined,
                'arrival': undefined,
                'time': undefined,
                'date': undefined
            };

            var DAY_BACKGROUND_LAYERS = ['mobiel_day', 'mobiel_tag'];
            var NIGHT_BACKGROUND_LAYERS = ['mobiel_night', 'mobiel_nacht'];

            var NIGHT_PLAN_START_HOUR = 1;
            var NIGHT_PLAN_END_HOUR = 6;

            var getNextNightDate = function(date) {
                var testDate = new Date(date.getTime());
                testDate = applyNightPlanStartHour(testDate);
                for(; testDate.getDay() < 6;) {
                    testDate.setDate(testDate.getDate() + 1);
                    if(isHoliday(testDate, 'NW')) {
                        break;
                    }
                }
                return testDate;
            };

            var applyNightPlanStartHour = function(date) {
                date.setHours(NIGHT_PLAN_START_HOUR);
                date.setMinutes(0);
                date.setSeconds(0);
                return date;
            };

            var updateTimetableDate = function() {
                var date = new Date();
                // now + 5 minutes
                date.setMinutes(date.getMinutes() + 5);

                var nightLayerIsActive = false;
                angular.forEach(NIGHT_BACKGROUND_LAYERS, function(layer) {
                    var isActive = LayersService.layerIsActive(layer);
                    if (isActive) {
                        nightLayerIsActive = true;
                    }
                });

                if(nightLayerIsActive) { // night-mode layer
                    var todayIsSunOrHoliday = isSunOrHoliday(date, 'NW');
                    // Saturday
                    if(date.getDay() === 6) {
                        // before night plan starts
                        if(date.getHours() < NIGHT_PLAN_START_HOUR) {
                            date = applyNightPlanStartHour(date);
                            // after night plan ends
                        } else if(date.getHours() >= NIGHT_PLAN_END_HOUR) {
                            date.setDate(date.getDate() + 1);
                            date = applyNightPlanStartHour(date);
                        }
                        // Sunday or Holiday
                    } else if(todayIsSunOrHoliday === true) {
                        // before night plan starts
                        if(date.getHours() < NIGHT_PLAN_START_HOUR) {
                            date = applyNightPlanStartHour(date);
                            // after night plan ends
                        } else if (date.getHours() >= NIGHT_PLAN_END_HOUR) {
                            date = getNextNightDate(date);
                        }
                        // any other day
                    } else {
                        date = getNextNightDate(date);
                    }
                }
                $scope.timetableInformation.time = $filter('date')(date, 'HH:mm');
                $scope.timetableInformation.date = $filter('date')(date, 'dd.MM.yyyy');
            };

            updateTimetableDate();

            var self = this;
            $rootScope.$watchCollection(function() {
                return LayersService.layers();
            }, function() {
                // initial hide layers
                stationsLayer.setVisible(false);
                stationPointLayer.setVisible(false);
                routeLayer.setVisible(false);

                var transportLayers = DAY_BACKGROUND_LAYERS.concat(NIGHT_BACKGROUND_LAYERS);
                angular.forEach(transportLayers, function(layer) {
                    var tLayer = LayersService.layerByName(layer);
                    if (tLayer) {
                        tLayer.offVisibleChange(handleVisibleChange);
                        tLayer.onVisibleChange(handleVisibleChange, self);
                        if (tLayer.getVisible()) {
                            handleVisibleChange(tLayer);
                        }
                    }
                });
            });

            var handleVisibleChange = function(tlayer) {
                var transportLayer = this;
                if (angular.isUndefined(transportLayer)) {
                    transportLayer = tlayer;
                }
                if (transportLayer.toggle) {
                    transportLayer.toggle = false;
                    return;
                }

                var transportLayerIsActive = transportLayer.getVisible();

                if (!transportLayerIsActive) {
                    $rootScope.timetableActive = false;
                    stationsLayer.setVisible(false);
                    stationPointLayer.setVisible(false);
                    routeLayer.setVisible(false);
                    return;
                }

                var layer = undefined;
                if(angular.isDefined(transportLayer)) {
                    var name = 'mobiel_day';
                    if ($.inArray(transportLayer.name, DAY_BACKGROUND_LAYERS) !== -1) {
                        name = 'mobiel_day';
                    } else if ($.inArray(transportLayer.name, NIGHT_BACKGROUND_LAYERS) !== -1) {
                        name = 'mobiel_night';
                    }
                    layer = '?layer=' + name + '&';
                }

                if (angular.isDefined(layer)) {
                    $rootScope.timetableActive = true;
                    stationsLayer.changeUrl(stationLayerURL + layer);
                    stationPointLayer.changeUrl(stationPointLayerURL + layer);
                    updateTimetableDate();
                    $scope.stationPopupLayers = [stationsLayer, stationPointLayer];
                    $scope.popupLayers = $scope.popupLayers.concat($scope.stationPopupLayers);
                    routeLayer.olLayer.setSource();
                    stationsLayer.setVisible(true);
                    stationPointLayer.setVisible(true);
                    routeLayer.setVisible(true);
                }

                var layerTypes = DAY_BACKGROUND_LAYERS;
                if ($.inArray(transportLayer.name, DAY_BACKGROUND_LAYERS) !== -1) {
                    layerTypes = NIGHT_BACKGROUND_LAYERS;
                } else if ($.inArray(transportLayer.name, NIGHT_BACKGROUND_LAYERS) !== -1) {
                    layerTypes = DAY_BACKGROUND_LAYERS;
                }

                angular.forEach(layerTypes, function(layer) {
                    var xtLayer = LayersService.layerByName(layer);
                    if (xtLayer !== undefined && xtLayer.getVisible()) {
                        xtLayer.toggle = true;
                        xtLayer.setVisible(false);
                    }
                });
            };

            var timetableControl = new anol.control.Control({
                element: angular.element('.timetable-control')
            });
            ControlsService.addControl(timetableControl);

            if($scope.timetableEnabled) {
                // wait a digest cycle before adding the control
                // cause timetable-informations uses ng-if, in first cycle
                // it's not rendered
                $timeout(function() {
                    var timetableInformationControl = new anol.control.Control({
                        element: angular.element('.timetable-informations')
                    });
                    ControlsService.addControl(timetableInformationControl);
                });
            }

            $scope.showTimetable = false;

            $scope.formattedJourneyDate = function() {
                var date = $scope.timetableInformation.date;
                var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
                var a = new Date(date.replace(pattern,'$3-$2-$1'));
                return $filter('date')(a, 'yyyyMMdd');
            };

            $rootScope.timetableOrigin = undefined;
            $rootScope.timetableOriginCity = 'Bielefeld';
            $rootScope.timetableDestination = undefined;
            $rootScope.timetableDestinationCity = 'Bielefeld';
            $scope.showTimetable = false;
            $rootScope.showTimetable = $scope.showTimetable;

            $scope.toggleTimetable = function(status) {
                $scope.showTimetable = !status;
                $rootScope.showTimetable = $scope.showTimetable;
            };

            $scope.$watch(function() {
                return $rootScope.timetableOrigin;
            }, function() {
                $scope.timetableInformation.origin = $rootScope.timetableOrigin;
            }, true);

            $scope.$watch(function() {
                return $rootScope.timetableDestination;
            }, function() {
                $scope.timetableInformation.destination = $rootScope.timetableDestination;
            }, true);

            $scope.$watch(function() {
                return $rootScope.timetableOriginCity;
            }, function() {
                $scope.timetableInformation.placeOrigin = $rootScope.timetableOriginCity;
            }, true);

            $scope.$watch(function() {
                return $rootScope.timetableDestinationCity;
            }, function() {
                $scope.timetableInformation.placeDestination = $rootScope.timetableDestinationCity;
            }, true);

            $scope.$watch(function() {
                return $rootScope.showTimetable;
            }, function() {
                $scope.showTimetable = $rootScope.showTimetable;
            }, true);

        }]);
