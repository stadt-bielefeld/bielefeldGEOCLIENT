angular.module('munimapAdmin')
    .controller('GroupsController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.groups = orderBy(ModelService.groups, 'name');
        $scope.selectedGroup = undefined;
        $scope.tab = {
            'users': true,
            'layers': false,
            'projects': false
        };

        $scope.availableUsers = [];
        $scope.assignedUsers = [];
        $scope.availableLayers = [];
        $scope.assignedLayers = [];
        $scope.availableProjects = [];
        $scope.assignedProjects = [];

        $scope.selectGroup = function(group) {
            $scope.selectedGroup = group;
            $timeout(function() {
            // wraped in timeout, otherwise selected group is not highlighted immediately
                $route.updateParams({'id': $scope.selectedGroup.id});
                $scope.updateLists();
            });
        };

        $scope.updateUserLists = function() {
            if(angular.isUndefined($scope.selectedGroup)) {
                $scope.availableUsers = [];
                $scope.assignedUsers = [];
                return;
            }
            var lists = ModelService.usersListsForGroup($scope.selectedGroup);
            $scope.availableUsers = orderBy(lists.availableUsers, 'name');
            $scope.assignedUsers = orderBy(lists.assignedUsers, 'name');
        };

        $scope.updateLayerLists = function() {
            if(angular.isUndefined($scope.selectedGroup)) {
                $scope.availableLayers = [];
                $scope.assignedLayers = [];
                return;
            }
            var lists = ModelService.layersListsForGroup($scope.selectedGroup);
            $scope.availableLayers = orderBy(lists.availableLayers, 'name');
            $scope.assignedLayers = orderBy(lists.assignedLayers, 'name');
        };

        $scope.updateProjectLists = function() {
            if(angular.isUndefined($scope.selectedGroup)) {
                $scope.availableProjects = [];
                $scope.assignedProjects = [];
                return;
            }
            var lists = ModelService.projectsListsForGroup($scope.selectedGroup);
            $scope.availableProjects = orderBy(lists.availableProjects, 'name');
            $scope.assignedProjects = orderBy(lists.assignedProjects, 'name');
        };

        $scope.updateLists = function() {
            $scope.updateUserLists();
            $scope.updateLayerLists();
            $scope.updateProjectLists();
        };

        $scope.assignUser = function(user) {
            var promise = ModelService.assignUserToGroup($scope.selectedGroup, user);
            promise.then($scope.updateUserLists);
        };

        $scope.deassignUser = function(user) {
            var promise = ModelService.deassignUserFromGroup($scope.selectedGroup, user);
            promise.then($scope.updateUserLists);
        };

        $scope.assignLayer = function(layer) {
            var promise = ModelService.assignLayerToGroup($scope.selectedGroup, layer);
            promise.then($scope.updateLayerLists);
        };

        $scope.deassignLayer = function(layer) {
            var promise = ModelService.deassignLayerFromGroup($scope.selectedGroup, layer);
            promise.then($scope.updateLayerLists);
        };

        $scope.assignProject = function(project) {
            var promise = ModelService.assignProjectToGroup($scope.selectedGroup, project);
            promise.then($scope.updateProjectLists);
        };

        $scope.deassignProject = function(project) {
            var promise = ModelService.deassignProjectFromGroup($scope.selectedGroup, project);
            promise.then($scope.updateProjectLists);
        };

        $scope.setTabUrl = function(tabName) {
            $route.updateParams({tab: tabName});
        };

        if(angular.isDefined($routeParams.id)) {
            var element = ModelService.groupById(parseInt($routeParams.id));
            if(angular.isDefined(element)) {
                $scope.selectedGroup = element;
                $scope.updateLists();
                $scope.scrollToActive(angular.element('#group-list'));
            }
        }
        if(angular.isDefined($routeParams.tab)) {
            $scope.setSubpage('group-' + $routeParams.tab);
        } else {
            $scope.setSubpage('group-users');
        }
    }]);