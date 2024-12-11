angular.module('munimapAdmin')
    .controller('UsersController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.users = orderBy(ModelService.users, 'name');
        $scope.selectedUser = undefined;

        $scope.availableGroups = [];
        $scope.assignedGroups = [];

        $scope.setSubpage('user-groups');

        $scope.selectUser = function(user) {
            $scope.selectedUser = user;
            $timeout(function() {
            // wraped in timeout, otherwise selected group is not highlighted immediately
                $route.updateParams({'id': $scope.selectedUser.id});
                $scope.updateGroupLists();
            });
        };

        $scope.updateGroupLists = function() {
            if(angular.isUndefined($scope.selectedUser)) {
                $scope.availableGroups = [];
                $scope.assignedGroups = [];
                return;
            }
            var lists = ModelService.groupsListsForUser($scope.selectedUser);
            $scope.availableGroups = orderBy(lists.availableGroups, 'name');
            $scope.assignedGroups = orderBy(lists.assignedGroups, 'name');
        };

        $scope.assignGroup = function(group) {
            var promise = ModelService.assignUserToGroup(group, $scope.selectedUser);
            promise.then($scope.updateGroupLists);
        };

        $scope.deassignGroup = function(group) {
            var promise = ModelService.deassignUserFromGroup(group, $scope.selectedUser);
            promise.then($scope.updateGroupLists);
        };

        if(angular.isDefined($routeParams.id)) {
            var element = ModelService.userById(parseInt($routeParams.id));
            if(angular.isDefined(element)) {
                $scope.selectedUser = element;
                $scope.updateGroupLists();
                $scope.scrollToActive(angular.element('#user-list'));
            }
        }
    }]);