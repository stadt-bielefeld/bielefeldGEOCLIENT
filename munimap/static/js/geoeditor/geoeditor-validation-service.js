import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

function GeoeditorValidationServiceProvider() {
    this.$get = ['$rootScope', 'DrawService', 'LayersService', 'munimapConfig',
        function ($rootScope, DrawService, LayersService, munimapConfig) {

        var invalidFeatureLayer = new anol.layer.Feature({
            olLayer: {
                zIndex: 2000,
                style: function (feature) {
                    var geometry;

                    switch (feature.getGeometry().getType()) {
                    case 'Point':
                        geometry = feature.getGeometry();
                        break;
                    case 'LineString':
                        geometry = new Point(feature.getGeometry().getCoordinateAt(0.5));
                        break;
                    case 'Polygon':
                        geometry = feature.getGeometry().getInteriorPoint(0.5);
                        break;
                    }

                    return [new Style({
                        geometry: geometry,
                        image: new Circle({
                            radius: 12,
                            stroke: new Stroke({
                                color: 'red',
                                width: 2
                            }),
                            fill: new Fill({
                                color: 'rgba(255, 0, 0, 0.2)'
                            })
                        }),
                        text: new Text({
                            text: '!',
                            font: '20px sans-serif',
                            fill: new Fill({
                                color: 'red'
                            })
                        })
                    })];
                }
            }
        });

        LayersService.addSystemLayer(invalidFeatureLayer);

        /**
         * @param {FormField} formField
         * @param {any} value
         * @return {boolean}
         */
        function validateFormField (formField, value) {
            if (formField.required) {
                switch (formField.type) {
                    case 'select':
                        return angular.isDefined(value) && value !== '';
                    case 'int':
                    case 'float':
                        return angular.isNumber(value);
                    case 'text':
                        return angular.isString(value) && value !== '';
                }
            }
            return true;
        }

        /**
         * @param {Feature} feature
         */
        function updateFeatureValidationStatus (feature) {
            const invalidFeatures = invalidFeatureLayer.getFeatures();

            invalidFeatureLayer.clear();

            if (DrawService.activeLayer.getFeatures().indexOf(feature) < 0) {
                const index = invalidFeatures.indexOf(feature);
                if (index > -1) {
                    invalidFeatures.splice(index, 1);
                }
                invalidFeatureLayer.addFeatures(invalidFeatures);
                return;
            }

            const formFields = getFormConfig(feature) || [];
            const valid = formFields.every(function (field) {
                return validateFormField(field, feature.get('formValues')[field.name]);
            });

            const index = invalidFeatures.indexOf(feature);

            if (!valid && index < 0) {
                invalidFeatures.push(feature);
            }
            if (valid && index > -1) {
                invalidFeatures.splice(index, 1);
            }

            invalidFeatureLayer.addFeatures(invalidFeatures);

            $rootScope.$broadcast('geoeditor:validation');
        }

        function getFormConfig (feature) {
          var formFields = munimapConfig.geoeditor.formFields;
          // only get the form config if there are form fields
          if(formFields) {
            switch (feature.getGeometry().getType()) {
              case 'Point':
                return formFields.point;
              case 'LineString':
                return formFields.line;
              case 'Polygon':
                return formFields.polygon;
              default:
                throw new Error('Unsupported geometry type: ' + feature.getGeometry().getType());
            }
          }
        }

        function allFeaturesValid () {
            invalidFeatureLayer.clear();

            const invalidFeatures = [];

            DrawService.activeLayer.getFeatures().forEach(function (feature) {
                var formFields = getFormConfig(feature) || [];
                const valid = formFields.every(function (field) {
                    return validateFormField(field, feature.get('formValues')[field.name]);
                });

                if (!valid) {
                    invalidFeatures.push(feature);
                }
            });

            invalidFeatureLayer.addFeatures(invalidFeatures);

            $rootScope.$broadcast('geoeditor:validation');

            return invalidFeatures.length === 0;
        }

        function getMissingFeatures() {
            var geometries = munimapConfig.geoeditor.geometries;

            const missing = {
                point: 0,
                line: 0,
                polygon: 0
            }

            if (angular.isUndefined(geometries)) {
                return missing;
            }

            Object.entries(geometries).forEach(function (entry) {
                const type = entry[0];
                const config = entry[1];
                if (angular.isDefined(config.min)) {
                    const olType = {
                        'point': 'Point',
                        'line': 'LineString',
                        'polygon': 'Polygon'
                    }[type];

                    const features = DrawService.activeLayer.getFeatures().filter(function (feature) {
                        return feature.getGeometry().getType() === olType;
                    })

                    if (features.length < config.min) {
                        missing[type] = config.min - features.length;
                    }
                }
            });

            return missing;
        }

        /**
        * Validates everything.
        */
        function validate() {
            const missingFeatures = this.getMissingFeatures();
            const hasMissingFeatures = Object.values(missingFeatures).some(function (missing) {
                return missing > 0;
            });

            const allFeaturesValid = this.allFeaturesValid();

            return {
                hasMissingFeatures: hasMissingFeatures,
                missingFeatures: missingFeatures,
                allFeaturesValid: allFeaturesValid
            };
        }

        return {
            validateFormField: validateFormField,
            updateFeatureValidationStatus: updateFeatureValidationStatus,
            allFeaturesValid: allFeaturesValid,
            getMissingFeatures: getMissingFeatures,
            validate: validate
        }
    }];
}

angular.module('munimapGeoeditor')
    .provider('GeoeditorValidationService', GeoeditorValidationServiceProvider);
