angular.module('munimapAdmin')
    .controller('LogsListController', ['$scope', 'ModelService', function($scope, ModelService) {

        $scope.logs = ModelService.logs;
        $scope.date = Date.now();

        $scope.removeLog = function(name) {
            ModelService.removeLog(name);
        };

    }]);