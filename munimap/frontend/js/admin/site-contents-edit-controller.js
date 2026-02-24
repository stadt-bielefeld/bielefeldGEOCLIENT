angular.module('munimapAdmin')
    .controller('SiteContentsEditController', ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'orderByFilter', 'ModelService',
        function($scope, $location, $route, $routeParams, $timeout, $window, orderBy, ModelService) {
            $scope.site_content = {
                csrf_token: undefined,
                name: undefined,
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
                var _site_content = angular.copy($scope.site_content);
                if(angular.isDefined(_site_content.name)) {
                    ModelService.updateSiteContent(_site_content).then(function(data) {
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
                $scope.site_content.name = $routeParams.configName;
                var _site_content = {
                    name: $routeParams.configName
                };
                ModelService.loadSiteContent(_site_content).then(function(code) {
                    $scope.site_content.code = code;
                    $scope.loading = false;
                });
            }
        }]);
