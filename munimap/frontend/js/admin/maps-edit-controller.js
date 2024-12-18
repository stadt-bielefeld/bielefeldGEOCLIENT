angular.module('munimapAdmin')
    .controller('MapsEditController', ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'orderByFilter', 'ModelService', 
        function($scope, $location, $route, $routeParams, $timeout, $window, orderBy, ModelService) {
            $scope.config = {
                csrf_token: undefined,
                name: undefined,
                new: undefined,
                code: undefined,
                adminSave: undefined
            };
            $scope.errors = undefined;
            $scope.loading = false;
            $scope.localErrors = undefined;
            $scope.informalOnly = undefined;

            $scope.hgt = $window.innerHeight - 240;

            $scope.adminSave = function() {
                $scope.config.adminSave = true;
                $scope.submit();
            };
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
                var _config = angular.copy($scope.config);
                if(angular.isDefined(_config.name)) {
                    ModelService.updateMapConfig(_config).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                            $scope.localErrors = undefined;
                        } else {
                            $scope.errors = data.errors;
                            $scope.localErrors = data.local_errors;
                            $scope.informalOnly = data.informal_only;
                        }
                    });
                } else {
                    ModelService.addMapConfig(_config).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                            $scope.localErrors = undefined;
                        } else {
                            $scope.errors = data.errors;
                            $scope.localErrors = data.local_errors;
                            $scope.informalOnly = data.informal_only;
                        }
                    });
                }
            };

            angular.element($window).on('resize', function () {
                $scope.hgt = $window.innerHeight - 240;
            });    

            if(angular.isDefined($routeParams.configName)) {
                $scope.loading = true;
                $scope.config.name = $routeParams.configName;
                var _config = {
                    name: $routeParams.configName
                };
                ModelService.loadMapConfig(_config).then(function(code) {
                    $scope.config.code = code;
                    $scope.loading = false;
                });
            }
        }]);