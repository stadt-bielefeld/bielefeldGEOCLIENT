angular.module('munimapBase.alkisButton', ['anol.map'])

    .directive('alkisButton', ['ControlsService', function(ControlsService) {
        return {
            templateUrl: 'munimap/alkisbutton.html',
            transclude: true,
            replace: false,
            link: function(scope, element, attributes) {
                scope.alkisContainerVisible = false;

                var alkisControl = new anol.control.Control({
                    element: element.find('.alkis-control'),
                    exclusive: true,
                    target: angular.element('.left-controls-wrapper')
                });

                alkisControl.onDeactivate(function() {
                    scope.alkisContainerVisible = false;
                    scope.$apply();
                });

                scope.toggle = function() {
                    if (scope.alkisContainerVisible) {
                        scope.alkisContainerVisible = false;
                        alkisControl.activate();
                        alkisControl.deactivate();
                    } else {
                        scope.alkisContainerVisible = true;
                    }
                };

                ControlsService.addControl(alkisControl);
            }
        };
    }]);
