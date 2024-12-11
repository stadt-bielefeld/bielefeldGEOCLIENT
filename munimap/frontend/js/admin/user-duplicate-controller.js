angular.module('munimapAdmin')
    .controller('UserDuplicateController', ['$scope', '$routeParams', 'ModelService',  'uibDateParser',
        function($scope, $routeParams,  ModelService, uibDateParser) {
            $scope.userConfig = {
                csrf_token: undefined,
                mb_user_id: undefined,
                mb_user_name: undefined,
                mb_user_firstname: undefined,
                mb_user_lastname: undefined,
                mb_user_academictitle: undefined,
                mb_user_password: undefined,
                mb_user_email: undefined,
                mb_user_description: undefined,
                mb_user_phone: undefined,
                mb_user_facsimile: undefined,
                mb_user_street: undefined,
                mb_user_housenumber: undefined,
                mb_user_delivery_point: undefined,
                mb_user_postal_code: undefined,
                mb_user_city: undefined,
                mb_user_organisation_name: undefined,
                mb_user_department: undefined,
                mb_user_position_name: undefined,
                mb_user_country: undefined,
                mb_user_dienstkey: undefined,
                mb_user_login_count: undefined,
                mb_user_active: undefined,
                mb_user_idm_managed: undefined,
                groups: undefined,
                mb_user_valid_to: undefined,
                mb_user_valid_from: undefined,
            };
            $scope.errors = undefined;
            $scope.loading = false;
            $scope.dateOptions = {
                dateDisabled: false,
                formatYear: 'yyyy',
                minDate: new Date(2020, 1, 1),
                showWeeks: false,
                startingDay: 1
            };
            $scope.altInputFormats = ['dd.MM.yyyy'];
            $scope.open = function() {
                $scope.popup.opened = true;
            };

            $scope.popup = {
                opened: false
            };              
            $scope.format = 'dd.MM.yyyy';

            $scope.$watch('userConfig.mb_user_valid_to', function(n, o) {
                var date = uibDateParser.parse(n, 'dd.MM.yyyy');
                $scope.dt = date;
            });

            $scope.submit = function() {
                var _userConfig = angular.copy($scope.userConfig);
                if ($scope.dt) {
                    _userConfig.mb_user_valid_to = $scope.dt.ddmmyyyy();
                } else {
                    _userConfig.mb_user_valid_to = null;
                }
                var formErrors = document.getElementsByClassName('form-error');
                angular.forEach(formErrors, function(elem) {
                    var errorElement =  angular.element(elem);
                    errorElement.html('');
                });

                ModelService.addUser(_userConfig, true).then(function(data) {
                    if (!data.success) {
                        angular.forEach(data.errors, function(idx, name) {
                            var errorElement = angular.element(document.querySelector( '#'+ name +'_error' ) );
                            errorElement.html(idx);
                        });
                    }
                });
            };

            if(angular.isDefined($routeParams.userId)) {
                $scope.loading = true;
                $scope.userConfig.mb_user_id = $routeParams.userId;
                var _config = {
                    userId: $routeParams.userId
                };
                ModelService.loadUser(_config, true).then(function(data) {
                    $scope.loading = false;
                    if(angular.isDefined(data.user)) {
                        $scope.userConfig = angular.copy(data.user);
                    }
                });

            }
        }]);