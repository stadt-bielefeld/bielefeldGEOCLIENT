import defaultPluginText from '!!raw-loader!./plugins-edit-controller-default-plugin.js';

angular.module('munimapAdmin')
    .controller('PluginEditController', ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'orderByFilter', 'ModelService',
        function($scope, $location, $route, $routeParams, $timeout, $window, orderBy, ModelService) {
            $scope.plugin = {
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
                var _plugin = angular.copy($scope.plugin);
                if(angular.isDefined(_plugin.name)) {
                    ModelService.updatePlugin(_plugin).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                        } else {
                            $scope.errors = data.errors;
                        }
                    });
                } else {
                    ModelService.addPlugin(_plugin).then(function(data) {
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

            if(angular.isDefined($routeParams.configName)) {
                $scope.loading = true;
                $scope.plugin.name = $routeParams.configName;
                var _plugin = {
                    name: $routeParams.configName
                };
                ModelService.loadPlugin(_plugin).then(function(code) {
                    $scope.plugin.code = code;
                    $scope.loading = false;
                });
            } else {
                $scope.plugin.code = defaultPluginText;
            }
        }]);
