angular.module('munimapGeoeditor')
    .controller('geoeditorPopupController', ['$scope', '$rootScope', 'GeoeditorValidationService', 'munimapConfig',
        function ($scope, $rootScope, GeoeditorValidationService, munimapConfig) {
            $scope.defaultPopupTabContent = 'geoeditor';
            $scope.showGeoeditorTab = true;

            $scope.$on('geoeditor:openPopupFor', function (event, layer, feature) {

                feature.set('formValues', {})

                let showForm = true;

                if (angular.isUndefined(munimapConfig.geoeditor.formFields)) {
                    showForm = false;
                } else {
                    const geometryType = feature.getGeometry().getType();
                    const type = {
                        'Point': 'point',
                        'LineString': 'line',
                        'Polygon': 'polygon'
                    }[geometryType];
                    const formFields = munimapConfig.geoeditor.formFields[type];
                    if (angular.isUndefined(formFields) || formFields.length === 0) {
                        showForm = false;
                    }
                }

                $scope.showGeoeditorTab = showForm;

                if (!showForm) {
                    if (!munimapConfig.geoeditor.customStyling) {
                        return;
                    }
                    $scope.defaultPopupTabContent = undefined;
                } else {
                    $scope.defaultPopupTabContent = 'geoeditor';
                }

                $scope.openGeoeditorPopupFor = {
                    layer: layer,
                    feature: feature
                };
                $scope.highlightInvalid = false;
            });

            $scope.$on('geoeditor:closePopup', function () {
                $scope.openGeoeditorPopupFor = {
                    coordinate: undefined
                };
            });

            $scope.openGeoeditorPopupFor = undefined;

            /**
             * @param {Feature} feature
             */
            $scope.onCloseGeoeditorPopup = function (feature) {
                if (feature) {
                    GeoeditorValidationService.updateFeatureValidationStatus(feature);
                }
                $scope.highlightInvalid = true;
            };

            /**
             * @param {FormField} field
             * @param {any} value
             * @return {boolean}
             */
            $scope.isValid = function (field, value) {
                return GeoeditorValidationService.validateFormField(field, value);
            };
        }]);
