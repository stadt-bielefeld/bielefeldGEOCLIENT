import {DigitizeState} from "anol/src/modules/savemanager/digitize-state";

angular.module('munimapDigitize')
    .controller('digitizePopupController', ['$scope',
        function ($scope) {
            $scope.$on('digitize:openPopupFor', function (event, layer, feature) {
                $scope.openDigitizePopupFor = {
                    layer: layer,
                    feature: feature
                };
            });

            $scope.featureFilter = feature => feature.get('_digitizeState') !== DigitizeState.REMOVED;

            $scope.$on('digitize:closePopup', function () {
                $scope.openDigitizePopupFor = {
                    coordinate: undefined
                };
            });

            $scope.openDigitizePopupFor = undefined;

            $scope.formFields = undefined;
        }]);
