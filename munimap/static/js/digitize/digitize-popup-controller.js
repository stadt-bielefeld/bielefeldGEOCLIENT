import {DigitizeState} from "anol/src/modules/savemanager/digitize-state";

angular.module('munimapDigitize')
    .controller('digitizePopupController', ['$scope',
        function ($scope) {
            const featureFilter = feature => feature.get('_digitizeState') !== DigitizeState.REMOVED;

            $scope.$on('digitize:openPopupFor', function (event, layer, feature) {
                if (featureFilter(feature)) {
                    $scope.openDigitizePopupFor = {
                        layer: layer,
                        feature: feature
                    };
                }
            });

            $scope.featureFilter = featureFilter;

            $scope.$on('digitize:closePopup', function () {
                $scope.openDigitizePopupFor = {
                    coordinate: undefined
                };
            });

            $scope.openDigitizePopupFor = undefined;

            $scope.formFields = undefined;
        }]);
