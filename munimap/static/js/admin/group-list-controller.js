angular.module('munimapAdmin')
    .controller('GroupListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.groups = orderBy(ModelService.groups, 'name');

        $scope.setSubpage(undefined);

        $scope.removeGroup = function(group) {
            ModelService.removeGroup(group)
                .then(function() {
                    $scope.groups = orderBy(ModelService.groups, 'name');
                });
        };
    }]);