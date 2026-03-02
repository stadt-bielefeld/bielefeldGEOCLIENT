angular.module('munimapAdmin')
    .controller('SiteContentsListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.site_contents = orderBy(ModelService.site_contents);
        $scope.reverse = false;
        $scope.setSubpage(undefined);
        $scope.enviroment = ModelService.enviroment;
    }]);
