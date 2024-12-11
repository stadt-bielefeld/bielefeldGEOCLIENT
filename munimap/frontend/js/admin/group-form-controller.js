angular.module('munimapAdmin')
    .controller('GroupFormController', ['$scope', '$route', '$routeParams', '$location', '$timeout', 'ModelService', function($scope, $route, $routeParams, $location, $timeout, ModelService) {
        $scope.group = {
            csrf_token: undefined,
            id: undefined,
            name: undefined,
            title: undefined,
            description: undefined
        };
        $scope.setSubpage(undefined);

        $scope.submit = function() {
            var _group = angular.copy($scope.group);
            if(angular.isDefined(_group.id)) {
                ModelService.updateGroup(_group).then(function() {
                    $location.path('groups/list');
                });
            } else {
                ModelService.addGroup(_group).then(function(group) {
                    $location.path('groups').search({'id': group.id});
                });
            }
        };

        if(angular.isDefined($routeParams.groupId)) {
            var group = ModelService.groupById(parseInt($routeParams.groupId));
            if(angular.isDefined(group)) {
                $scope.group = angular.copy(group);
            }
        }
    }]);