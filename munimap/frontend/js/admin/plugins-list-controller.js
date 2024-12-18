angular.module('munimapAdmin')
    .controller('PluginListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.plugins = orderBy(ModelService.plugins);
        $scope.reverse = false;
        $scope.setSubpage(undefined);
        $scope.enviroment = ModelService.enviroment;

        $scope.rename = function(name, newName) {
            ModelService.renamePluginConfig(name, newName)
                .then(function() {
                    $scope.plugins = orderBy(ModelService.plugins);
                });
        };

        $scope.removePlugin = function(pluginName) {
            ModelService.removePlugin(pluginName)
                .then(function() {
                    $scope.plugins = orderBy(ModelService.plugins);
                });
        };

    }]);
