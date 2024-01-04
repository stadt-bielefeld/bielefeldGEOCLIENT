import {DigitizeState} from 'anol/src/modules/savemanager/digitize-state';

angular.module('munimapDigitize')
    .controller('digitizePopupController', ['$scope', 'SaveManagerService',
        function ($scope, SaveManagerService) {
            const featureFilter = feature => feature.get('_digitizeState') !== DigitizeState.REMOVED;

            $scope.featureFilter = featureFilter;
            $scope.needsRefresh = false;
            $scope.openDigitizePopupFor = undefined;
            $scope.featureEditorProps = {};
            $scope.formFields = undefined;
            $scope.closePopup = () => {
                $scope.openDigitizePopupFor = {
                    coordinate: undefined
                };
                $scope.featureEditorProps = {};
            };

            $scope.$on('digitize:openPopupFor', function (event, layer, feature) {
                $scope.openDigitizePopupFor = {
                    layer: layer.olLayer,
                    feature: feature
                };
                $scope.featureEditorProps = {
                    layer: layer,
                    feature: feature
                };
                $scope.needsRefresh = SaveManagerService.hasFeaturePollingChanges(feature.getId(), layer);
            });

            $scope.$on('digitize:closePopup', function () {
                $scope.closePopup();
            });

            const handleSaveManagerEvt = (evt, data) => {
                if (Object.keys($scope.featureEditorProps).length === 0) {
                    return;
                }
                const layerName = $scope.featureEditorProps.layer.name;
                const feature = $scope.featureEditorProps.feature;
                if (data.layerName !== layerName) {
                    return;
                }
                if (feature.getId() === undefined) {
                    return;
                }
                if (data.success) {
                    $scope.needsRefresh = SaveManagerService.hasFeaturePollingChanges(feature.getId(), $scope.featureEditorProps.layer);
                } else {
                    $scope.needsRefresh = false;
                }
            };

            $scope.$on('SaveManagerService:polling', handleSaveManagerEvt);

            $scope.$on('SaveManagerService:refreshLayer', handleSaveManagerEvt);
        }]);
