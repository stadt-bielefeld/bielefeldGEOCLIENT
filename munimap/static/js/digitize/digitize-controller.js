angular.module('munimapDigitize')
    .controller('digitizeController', ['$scope', '$rootScope', '$olOn', 'MapService', 'DrawService', 'SaveManagerService', 'NotificationService',
        function ($scope, $rootScope, $olOn, MapService, DrawService, SaveManagerService, NotificationService) {

            $scope.drawLayer = undefined;

            $scope.needsRefresh = false;
            $scope.showPollingError = false;

            $scope.hasChanges = function () {
                if ($scope.drawLayer === undefined) {
                    return false;
                }
                return SaveManagerService.hasChanges($scope.drawLayer.name);
            };

            $scope.saveChanges = function () {
                SaveManagerService.commit($scope.drawLayer).then(
                    function(responses_data) {
                        angular.forEach(responses_data, function(response) {
                            switch(response.status) {
                                case 200:
                                    NotificationService.addSuccess(response.data.message);
                                    break;
                                case 207:
                                    NotificationService.addWarning(response.data.message);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }, function(response) {
                        NotificationService.addError(response.message);
                    }
                );
            };

            $scope.refreshLayer = function () {
                SaveManagerService.refreshLayer($scope.drawLayer);
            };

            $scope.$parent.$parent.openDigitizePopup = function (feature) {
                $rootScope.$broadcast('digitize:openPopupFor', $scope.drawLayer, feature);
            };

            // This following event is used to trigger an update of the popup configuration
            // when clicking on an existing geographic element on the map.
            // Without this event the popup element will show the configuration of the last
            // created element, i.e, it can show tabs for content that should be shown, like the attribute form,
            // even when there are no attributes present.
            $olOn(MapService.getMap(), 'singleclick', (evt) => {
                MapService.getMap().forEachFeatureAtPixel(evt.pixel, function(feature) {
                    $scope.$parent.$parent.openDigitizePopup(feature);
                }, {
                    layerFilter: candidate => candidate === $scope.drawLayer.olLayer,
                    hitTolerance: 10
                });
            });

            $scope.$parent.$parent.onDelete = function () {
                $rootScope.$broadcast('digitize:closePopup');
            };
            $scope.$parent.$parent.onModifySelect = function () {
                $rootScope.$broadcast('digitize:closePopup');
            };

            $scope.$on('SaveManagerService:polling', (evt, data) => {
                if (data.layerName !== $scope.drawLayer.name) {
                    return;
                }
                if (data.success) {
                    onPollingSuccess();
                } else {
                    onPollingError();
                }
            });

            var onPollingSuccess = function () {
                $scope.needsRefresh = SaveManagerService.hasPollingChanges(DrawService.activeLayer);
                $scope.showPollingError = false;
            };

            var onPollingError = function () {
                $scope.needsRefresh = false;
                $scope.showPollingError = true;
            };

            $scope.$watch(function () {
                return DrawService.activeLayer;
            }, function (newLayer, oldLayer) {
                $scope.drawLayer = newLayer;
                SaveManagerService.stopPolling(oldLayer.name);
                SaveManagerService.startPolling(newLayer.name);
            });
        }]);