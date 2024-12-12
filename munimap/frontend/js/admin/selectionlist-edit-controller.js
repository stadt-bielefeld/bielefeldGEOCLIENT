angular.module('munimapAdmin')
    .controller('SelectionlistEditController', ['$scope', '$location', '$route', '$routeParams', '$timeout', '$window', 'orderByFilter', 'ModelService',
        function($scope, $location, $route, $routeParams, $timeout, $window, orderBy, ModelService) {
            $scope.selectionlist = {
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
                var _selectionlist = angular.copy($scope.selectionlist);
                if(angular.isDefined(_selectionlist.name)) {
                    ModelService.updateSelectionlist(_selectionlist).then(function(data) {
                        if (data.success) {
                            $scope.errors = undefined;
                        } else {
                            $scope.errors = data.errors;
                        }
                    });
                } else {
                    ModelService.addSelectionlist(_selectionlist).then(function(data) {
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
                $scope.selectionlist.name = $routeParams.configName;
                var _selectionlist = {
                    name: $routeParams.configName
                };
                ModelService.loadSelectionlist(_selectionlist).then(function(code) {
                    $scope.selectionlist.code = code;
                    $scope.loading = false;
                });
            }
        }]);
