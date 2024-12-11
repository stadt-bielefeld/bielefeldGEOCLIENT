angular.module('munimapAdmin')
    .controller('ProjectsController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', 
        function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
            $scope.projects = orderBy(ModelService.protectedProjectsList, 'name');
            $scope.selectedProject = undefined;

            $scope.availableGroups = [];
            $scope.assignedGroups = [];

            $scope.setSubpage('project-groups');

            $scope.selectProject = function(project) {
                $scope.selectedProject = project;
                $timeout(function() {
                // wraped in timeout, otherwise selected group is not highlighted immediately
                    $route.updateParams({'id': $scope.selectedProject.id});
                    $scope.updateGroupLists();
                });
            };

            $scope.updateGroupLists = function() {
                if(angular.isUndefined($scope.selectedProject)) {
                    $scope.availableGroups = [];
                    $scope.assignedGroups = [];
                    return;
                }
                var lists = ModelService.groupsListsForProject($scope.selectedProject);
                $scope.availableGroups = orderBy(lists.availableGroups, 'name');
                $scope.assignedGroups = orderBy(lists.assignedGroups, 'name');
            };

            $scope.assignGroup = function(group) {
                var promise = ModelService.assignProjectToGroup(group, $scope.selectedProject);
                promise.then($scope.updateGroupLists);
            };

            $scope.deassignGroup = function(group) {
                var promise = ModelService.deassignProjectFromGroup(group, $scope.selectedProject);
                promise.then($scope.updateGroupLists);
            };

            if(angular.isDefined($routeParams.id)) {
                var element = ModelService.projectById(parseInt($routeParams.id));
                if(angular.isDefined(element)) {
                    $scope.selectedProject = element;
                    $scope.updateGroupLists();
                    $scope.scrollToActive(angular.element('#project-list'));
                }
            }
        }]);