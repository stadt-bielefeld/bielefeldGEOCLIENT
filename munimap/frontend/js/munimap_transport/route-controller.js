angular.module('munimapBase')
    .controller('routeController', ['$scope', '$timeout', 'LayersService', 'routesUrl',
        function($scope, $timeout, LayersService, routesUrl) {
        
        var routeLayer = LayersService.layerByName('display_routes');

        $scope.selectedRef = undefined;

        $scope.timetableDocuments = false;;

        $scope.highlightedRoute = undefined;

        $scope.toggleRef = function(ref){
            if($scope.selectedRef === ref) {
                $scope.selectedRef = undefined;
            } else {
                $scope.selectedRef = ref;
            }
            // unset current highlighted route
            $scope.toggleRoute();
            $timeout(function() {
                $scope.$apply();
            });
        };

        $scope.toggleRoute = function(id) {
            if($scope.highlightedRoute === id) {
                $scope.highlightedRoute = undefined;
            } else {
                $scope.highlightedRoute = id;
            }
            if($scope.highlightedRoute === undefined) {
                routeLayer.changeUrl(undefined);
            } else {
                routeLayer.changeUrl(routesUrl + $scope.highlightedRoute);
            }

        };
    }]);