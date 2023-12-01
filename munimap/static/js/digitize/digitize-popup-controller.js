import {DigitizeState} from 'anol/src/modules/savemanager/digitize-state';

angular.module('munimapDigitize')
    .controller('digitizePopupController', ['$scope', 'SaveManagerService',
        function ($scope, SaveManagerService) {
            const featureFilter = feature => feature.get('_digitizeState') !== DigitizeState.REMOVED;

            $scope.featureFilter = featureFilter;
            $scope.needsRefresh = false;
            $scope.openDigitizePopupFor = undefined;
            $scope.lastOpenedPopup = undefined;
            $scope.formFields = undefined;

            $scope.$on('digitize:openPopupFor', function (event, layer, feature) {
                $scope.openDigitizePopupFor = {
                    layer: layer.olLayer,
                    feature: feature
                };
                $scope.lastOpenedPopup = {
                    layer: layer,
                    feature: feature
                };
                $scope.needsRefresh = SaveManagerService.hasFeaturePollingChanges(feature.getId(), layer);
            });

            $scope.$on('digitize:closePopup', function () {
                $scope.openDigitizePopupFor = {
                    coordinate: undefined
                };
                $scope.lastOpenedPopup = undefined;
            });

            $scope.$on('SaveManagerService:polling', (evt, data) => {
                if ($scope.lastOpenedPopup === undefined) {
                    return;
                }
                const layerName = $scope.lastOpenedPopup.layer.name;
                const feature = $scope.lastOpenedPopup.feature;
                if (data.layerName !== layerName) {
                    return;
                }
                if (feature.getId() === undefined) {
                    return;
                }
                if (data.success) {
                    $scope.needsRefresh = SaveManagerService.hasFeaturePollingChanges(feature.getId(), $scope.lastOpenedPopup.layer);
                } else {
                    $scope.needsRefresh = false;
                }
            });
        }]);
