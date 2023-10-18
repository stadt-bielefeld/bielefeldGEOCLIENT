angular.module('munimapDigitize')
    .controller('digitizeController', ['$scope', '$rootScope', '$olOn', 'MapService', 'DrawService', 'SaveManagerService',
        function ($scope, $rootScope, $olOn, MapService, DrawService, SaveManagerService) {

            $scope.drawLayer = undefined;

            $scope.hasChanges = function () {
                return Object.keys(SaveManagerService.changedLayers).length > 0;
            };

            $scope.saveChanges = function () {
                var lastActiveLayer = DrawService.activeLayer;
                SaveManagerService.commitAll().then(
                    function(responses) {
                        angular.forEach(responses, function(response) {
                            NotificationService.addSuccess(response.message);
                        });
                        DrawService.changeLayer(lastActiveLayer);
                    }, function(responses) {
                        angular.forEach(responses, function(response) {
                            NotificationService.addError(response.message);
                        });
                        DrawService.changeLayer(lastActiveLayer);
                    }
                );
            };

            $scope.$parent.$parent.openDigitizePopup = function (layer, feature) {
                $rootScope.$broadcast('digitize:openPopupFor', layer, feature);
            };

            // This following event is used to trigger an update of the popup configuration
            // when clicking on an existing geographic element on the map.
            // Without this event the popup element will show the configuration of the last
            // created element, i.e, it can show tabs for content that should be shown, like the attribute form, 
            // even when there are no attributes present.
            $olOn(MapService.getMap(), 'singleclick', (evt) => {
                MapService.getMap().forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                    $scope.$parent.$parent.openDigitizePopup(layer, feature);
                });
            });

            $scope.$parent.$parent.onDelete = function () {
                $rootScope.$broadcast('digitize:closePopup');
            };
            $scope.$parent.$parent.onModifySelect = function () {
                $rootScope.$broadcast('digitize:closePopup');
            };

            $scope.$watch(function() {
                return DrawService.activeLayer;
            }, function (newVal) {
                $scope.drawLayer = newVal;
            });
        }]);
