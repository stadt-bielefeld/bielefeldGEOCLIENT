angular.module('munimapBase.servicebutton', ['anol.map'])

    .directive('serviceButton', ['ControlsService', '$rootScope', function(ControlsService) {
        return {
            templateUrl: 'munimap/servicebutton.html',
            transclude: true,
            replace: false,
            link: function(scope, element, attributes) {
                scope.toolsContainerVisible = false;

                scope.hideToolsContainer = function() {
                    scope.toolsContainerVisible = false;
                };

                var toolsControl = new anol.control.Control({
                    element: element.find('.tools-control'),
                    exclusive: true,
                    target: angular.element('.left-controls-wrapper')
                });

                toolsControl.onDeactivate(function() {
                    scope.toolsContainerVisible = false;
                    scope.$apply();
                });

                scope.toggle = function() {
                    if (scope.toolsContainerVisible) {
                        scope.toolsContainerVisible = false;
                        toolsControl.activate();
                        toolsControl.deactivate();
                    } else {
                        scope.toolsContainerVisible = true;
                    }
                };

                ControlsService.addControl(toolsControl);
            }
        };
    }]);
