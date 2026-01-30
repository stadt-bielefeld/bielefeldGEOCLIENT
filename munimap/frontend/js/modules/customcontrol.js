angular.module('munimapBase.customControl', ['anol.map'])

    .directive('customControl', ['$window', 'ControlsService', function($window, ControlsService) {
        return {
            templateUrl: 'munimap/customcontrol.html',
            transclude: true,
            replace: false,
            scope: {
                'controlText': '@',
                'controlTitle': '@',
                'controlCallback': '@',
                'controlShowTooltip': '='
            },
            link: function(scope, element, attributes) {
                scope.ngStyle = scope.$eval(attributes.ngStyle);

                scope.click = function() {
                    const callback = $window.customControlPlugins[scope.controlCallback];
                    if (!callback) {
                        return;
                    }
                    callback();
                };
                // button on openlayers
                var customControl = new anol.control.Control({
                    element: element.find('.custom-control'),
                    exclusive: false
                });

                ControlsService.addControl(customControl);
            }
        };
    }]);
