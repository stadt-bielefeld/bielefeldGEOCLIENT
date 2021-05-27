angular.module('munimapAdmin')
    .controller('ProjectListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.protectedProjects = ModelService.protectedProjects;
        $scope.projects = orderBy(ModelService.projectsForList(), 'name');
        $scope.setSubpage(undefined);
        $scope.enviroment = ModelService.enviroment;

        $scope.projectStatus = function(project) {
            if(project.missingConfig === true) {
                return 'missing';
            }
            if(angular.isDefined($scope.protectedProjects[project.name])) {
                return 'protected';
            }

            return 'unprotected';
        };

        $scope.transfer = function(project) {
            ModelService.transferProjectConfig(project)
                .then(function() {
                });
        };


        $scope.protect = function(project) {
            ModelService.protectProject(project)
                .then(function() {
                    $scope.protectedProjects = ModelService.protectedProjects;
                    $scope.projects = orderBy(ModelService.projectsForList(), 'name');
                });
        };

        $scope.unprotect = function(project) {
            ModelService.unprotectProject(project)
                .then(function() {
                    $scope.protectedProjects = ModelService.protectedProjects;
                    $scope.projects = orderBy(ModelService.projectsForList(), 'name');
                });
        };

        $scope.rename = function(name, newName) {
            ModelService.renameProjectConfig(name, newName)
                .then(function() {
                    $scope.protectedProjects = ModelService.protectedProjects;
                    $scope.projects = orderBy(ModelService.projectsForList(), 'name');
                });
        };
        
        $scope.removeProject = function(projectName) {
            ModelService.removeProject(projectName)
                .then(function() {
                    $scope.protectedProjects = ModelService.protectedProjects;
                    $scope.projects = orderBy(ModelService.projectsForList(), 'name');
                });
        };

    }]);