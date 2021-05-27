angular.module('munimap')

    .controller('digitizeController', ['$scope', 'LayersService', 'DrawService', 'SaveManagerService', 'NotificationService', 
        function($scope, LayersService, DrawService, SaveManagerService, NotificationService) {
            $scope.activeLayer = undefined;
            $scope.popupLayers = [];

            $scope.digitizePopupClosed = function() {
                $('.munimap-digitize-popup')
                    .find('[ng-init^=defaultSpectrumOptions]')
                    .find('input')
                    .spectrum('hide');
            };

            angular.forEach(LayersService.layers(), function(layer) {
                if(layer.saveable && $scope.currentDrawLayer === undefined) {
                    $scope.currentDrawLayer = layer;
                }
            });

            $scope.isActiveLayer = function(feature, layer) {
                if(layer === undefined || layer !== DrawService.activeLayer) {
                    return false;
                }
                return true;
            };

            $scope.editLayer = function(layer) {
                if(layer === $scope.activeLayer) {
                    layer = undefined;
                }
                DrawService.changeLayer(layer);
                if(layer !== undefined) {
                    $scope.$broadcast('sidebar.open', 'draw');
                }
            };

            $scope.saveChanges = function() {
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
                DrawService.changeLayer(undefined);
            };

            $scope.hasChanges = function() {
                return Object.keys(SaveManagerService.changedLayers).length > 0;
            };

            $scope.openPopup = function(layer, feature) {
                $scope.openPopupFor = {'layer': layer, 'feature': feature};
            };

            $scope.removeFeature = function(popup, anolLayer, feature) {
                anolLayer.olLayer.getSource().removeFeature(feature);
                popup.close();
            };

            $scope.deactivateDrawText = undefined;
            $scope.drawTextActive = false;
            $scope.drawTextDisabled = true;
            $scope.$watch('activeLayer', function(activeLayer) {
                $scope.drawTextActive = false;
                $scope.drawTextDisabled = activeLayer === undefined;
                if($scope.deactivateDrawText !== undefined) {
                    $scope.deactivateDrawText();
                    $scope.deactivateDrawText = undefined;
                }
            });

            $scope.textDrawn = function(layer, feature) {
                $scope.drawTextActive = false;
                $scope.deactivateDrawText = undefined;
                feature.set('style', {
                    'radius': 0
                });
            };

            $scope.drawText = function(createDrawFunc) {
                if($scope.deactivateDrawText === undefined) {
                    $scope.deactivateDrawText = createDrawFunc('Point', $scope.textDrawn);
                } else {
                    $scope.deactivateDrawText();
                    $scope.deactivateDrawText = undefined;
                }
                $scope.drawTextActive = $scope.deactivateDrawText !== undefined;
            };

            $scope.$watch(function() {
                return DrawService.activeLayer;
            }, function(activeLayer) {
                $scope.activeLayer = activeLayer;
                if(activeLayer === undefined) {
                    $scope.popupLayers = [];
                } else {
                    $scope.popupLayers = [activeLayer];
                }
            });
        }])
    .controller('popupController', ['$scope', '$timeout', function($scope, $timeout) {
        $scope.popupScope = $scope.$parent.$parent;
        $scope.popupTabContent = 'properties';
        $scope.isPoint = undefined;
        $scope.isText = undefined;

        $scope.popupScope.$watch('feature', function(feature) {
            $scope.isPoint = undefined;
            $scope.isText = undefined;

            if(feature === undefined) {
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

            $scope.isPoint = feature.getGeometry().getType() === 'Point';

            var style = feature.get('style');
            if(style === undefined) {
            // text always has a style object see digitizeController.$scope.drawText
                $scope.isText = false;
                $scope.isMarker = false;
            } else {
                $scope.isText = $scope.isPoint && (style.radius === 0 || style.radius === '0');
                $scope.isMarker = style.externalGraphic !== undefined;
            }

            // reset to properties tab if popup has a state not supported for current feature
            switch($scope.popupTabContent) {
            case 'style':
                if($scope.isPoint && $scope.isText) {
                    $scope.popupTabContent = 'properties';
                }
                break;
            case 'marker':
                if(!$scope.isPoint || $scope.isText) {
                    $scope.popupTabContent = 'properties';
                }
                break;
            case 'text':
                if(!$scope.isText) {
                    $scope.popupTabContent = 'properties';
                }
                break;
            }
        });

        $scope.$watch('popupTabContent', function(newTab, oldTab) {
            $('.munimap-digitize-popup .' + oldTab)
                .find('[ng-init^=defaultSpectrumOptions]')
                .find('input')
                .spectrum('hide');
            if(newTab === 'style') {
                var style = $scope.popupScope.feature.get('style');
                $scope.isMarker = style !== undefined && style.externalGraphic !== undefined;
            }
            if(newTab === 'style' || newTab === 'text') {
                $('.munimap-digitize-popup .popup-footer').css('border-color', 'transparent');
            } else {
                $('.munimap-digitize-popup .popup-footer').css('border-color', '');
            }

        });
    }]);
