angular.module('munimapAdmin')
    .controller('ProjectEditController', ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'orderByFilter', 'ModelService', 
        function($scope, $location, $route, $routeParams, $timeout, $window, orderBy, ModelService) {
            $scope.project = {
                csrf_token: undefined,
                name: undefined,
                new: undefined,
                code: undefined
            };
            $scope.errors = undefined;
            $scope.loading = false;
            $scope.hgt = $window.innerHeight - 240;

            $scope.submitViaKeypress = function(evt) {
                if (evt.type === 'keydown') {
                    if (evt.ctrlKey && evt.key == 's') {
                        evt.preventDefault();
                        this.submit();
                    }
                }
                return false;
            };

            $scope.submit = function() {
                var _project = angular.copy($scope.project);
                if(angular.isDefined(_project.name)) {
                    ModelService.updateProject(_project).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                        } else {
                            $scope.errors = data.errors;
                        }
                    });
                } else {
                    ModelService.addProject(_project).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                        } else {
                            $scope.errors = data.errors;
                        }
                    });
                }
            };

            angular.element($window).on('resize', function () {
                $scope.hgt = $window.innerHeight - 240;
            });    

            if(angular.isDefined($routeParams.projectName)) {
                $scope.loading = true;
                $scope.project.name = $routeParams.projectName;
                var _project = {
                    name: $routeParams.projectName
                };
                ModelService.loadProject(_project).then(function(code) {
                    $scope.project.code = code;
                    $scope.loading = false;
                });
            }
        }]);