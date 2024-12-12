angular.module('munimapBase.servicebutton', ['anol.map'])

    .directive('serviceButton', ['ControlsService', '$rootScope', function(ControlsService) {
        return {
            templateUrl: 'munimap/servicebutton.html',
            transclude: true,
            replace: true,
            link: function(scope, element, attributes) {
                scope.ngStyle = scope.$eval(attributes.ngStyle);
                scope.menuStyle = scope.$eval(attributes.menuStyle);
                scope.toolsContainerVisible = false;

                scope.hideToolsContainer = function() {
                    scope.toolsContainerVisible = false;
                };

                scope.toggle = function() {
                    if (toolsContainerControl.active) {
                        toolsContainerControl.deactivate(); 
                        // toggle alkis control to deactiave all other controls
                        toolsControl.activate();
                        toolsControl.deactivate();
                    } else {
                        toolsContainerControl.activate();        
                    }
                };
                // button on openlayers
                var toolsControl = new anol.control.Control({
                    element: element.find('.tools-control'),
                    exclusive: true
                });

                // container from the button - menu to toggle menus
                var toolsContainerControl = new anol.control.Control({
                    element: element.find('.tools-container-control'),
                    menu: true
                });

                ControlsService.addControl(toolsContainerControl);
                ControlsService.addControl(toolsControl);
            }
        };
    }]);