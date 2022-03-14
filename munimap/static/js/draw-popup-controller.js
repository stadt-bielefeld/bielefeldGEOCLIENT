angular.module('munimapDraw')
    .controller('popupController', ['$scope', '$timeout', function($scope, $timeout) {
        $scope.popupScope = $scope.$parent.$parent;
        $scope.popupTabContent = 'style';
        $scope.isPoint = undefined;
        $scope.isText = undefined;


        var lastStyle = {};

        $scope.popupScope.$watch('feature', function(currentFeature, lastFeature) {
            $scope.isPoint = undefined;
            $scope.isText = undefined;

            if(lastFeature !== undefined) {
                lastStyle = angular.copy(lastFeature.get('style'));
                delete lastStyle.text;
            }

            if(currentFeature === undefined) {
                $scope.popup = undefined;
                $scope.feature = undefined;
                $scope.layer = undefined;
                return;
            } else {
            // wait a digest cycle and trigger schemaform redraw
            // schemaform style value is changed and default form values
            // are overwritten by possible empty model values and stay empty
            // if we don't trigger redraw
                $timeout(function() {
                    $scope.$broadcast('schemaFormRedraw');
                });
            }
            $scope.popup = $scope.$parent.$parent;
            $scope.feature = $scope.popup.feature;
            $scope.layer = $scope.popup.layer;


            var style = currentFeature.get('style');
            if(style === undefined) {
            // text always has a style object see digitizeController.$scope.drawText
                $scope.isText = false;
                $scope.isMarker = false;
                $scope.popupContent = 'style';
                style = angular.copy(lastStyle);
            }

            $scope.isPoint = currentFeature.getGeometry().getType() === 'Point';
            $scope.isText = currentFeature.get('isText');
            $scope.isMarker = style !== undefined && style.externalGraphic !== undefined;

            // prefer isText over isMarker, because isMarker is assigned after lastStyle is merged
            if($scope.isPoint && $scope.isText) {
                $scope.popupTabContent = $scope.defaultPopupTabContent || 'text';
                style = {
                    text: style.text,
                    fontColor: style.fontColor,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    fontRotation: style.fontRotation,
                    radius: 0
                };
            } else if($scope.isPoint && $scope.isMarker) {
                $scope.popupTabContent = $scope.defaultPopupTabContent || 'marker';
                style = {
                    externalGraphic: style.externalGraphic,
                    graphicHeight: style.graphicHeight,
                    graphicWidth: style.graphicWidth,
                    graphicRotation: style.graphicRotation,
                    graphicXAnchor: style.graphicXAnchor,
                    graphicYAnchor: style.graphicYAnchor
                };
            } else {
                $scope.popupTabContent = $scope.defaultPopupTabContent || 'style';
                style = {
                    radius: style.radius === 0 ? undefined : style.radius,
                    strokeColor: style.strokeColor,
                    strokeOpacity: style.strokeOpacity,
                    strokeWidth: style.strokeWidth,
                    strokeDashstyle: style.strokeDashstyle,
                    fillColor: style.fillColor,
                    fillOpacity: style.fillOpacity
                };
            }
            currentFeature.set('style', style);
        });

        $scope.$watch('popupTabContent', function(newTab, oldTab) {
          $('.munimap-popup .' + oldTab)
                .find('[ng-init^=defaultSpectrumOptions]')
                .find('input')
                .spectrum('hide');
            if(newTab === 'style' && angular.isDefined($scope.popupScope.feature)) {
                var style = $scope.popupScope.feature.get('style');
                $scope.isMarker = style !== undefined && style.externalGraphic !== undefined;
            }
            if(newTab === 'style' || newTab === 'text') {
              $('.munimap-popup .popup-footer').css('border-color', 'transparent');
            } else {
              $('.munimap-popup .popup-footer').css('border-color', '');
            }

        });
    }]);
