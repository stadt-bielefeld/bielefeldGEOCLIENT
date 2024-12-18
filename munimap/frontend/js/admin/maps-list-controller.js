angular.module('munimapAdmin')
    .controller('MapsListController', 
        ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', 
            function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {

                $scope.configs = ModelService.configs;
                $scope.enviroment = ModelService.enviroment;

                $scope.transfer = function(project) {
                    ModelService.transferMapConfig(project)
                        .then(function() {});
                };

                $scope.rename = function(name, newName) {
                    ModelService.renameMapConfig(name, newName);
                };

                $scope.removeConfig = function(name) {
                    ModelService.removeMapConfig(name);
                };

            }]);