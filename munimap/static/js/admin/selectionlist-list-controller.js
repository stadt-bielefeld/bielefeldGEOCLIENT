angular.module('munimapAdmin')
    .controller('SelectionlistListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.selectionlists = orderBy(ModelService.selectionlists);
        $scope.reverse = false;
        $scope.setSubpage(undefined);
        $scope.enviroment = ModelService.enviroment;

        $scope.rename = function(name, newName) {
            ModelService.renameSelectionlistConfig(name, newName)
                .then(function() {
                    $scope.selectionlists = orderBy(ModelService.selectionlists);
                });
        };

        $scope.removeSelectionlist = function(selectionlistName) {
            ModelService.removeSelectionlist(selectionlistName)
                .then(function() {
                    $scope.selectionlists = orderBy(ModelService.selectionlists);
                });
        };

    }]);
