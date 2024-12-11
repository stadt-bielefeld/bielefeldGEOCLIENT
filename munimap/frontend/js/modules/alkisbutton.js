angular.module('munimapBase.alkisButton', ['anol.map'])

    .directive('alkisButton', ['ControlsService', function(ControlsService) {
        return {
            templateUrl: 'munimap/alkisbutton.html',
            transclude: true,
            replace: false,
            link: function(scope, element, attributes) {
                scope.ngStyle = scope.$eval(attributes.ngStyle);
                scope.menuStyle = scope.$eval(attributes.menuStyle);

                scope.toggle = function() {
                    if (alkisContainerControl.active) {
                        alkisContainerControl.deactivate();
                        // toggle alkis control to deactiave all other controls
                        alkisControl.activate();
                        alkisControl.deactivate();
                    } else {
                        alkisContainerControl.activate();                         
                    }
                };
                // button on openlayers
                var alkisControl = new anol.control.Control({
                    element: element.find('.alkis-control'),
                    exclusive: true
                });
                // container from the button - menu to toggle menus
                var alkisContainerControl = new anol.control.Control({
                    element: element.find('.alkis-container-control'),
                    menu: true
                });

                ControlsService.addControl(alkisContainerControl);
                ControlsService.addControl(alkisControl);
            }
        };
    }]);