import 'angular-ui-bootstrap';

angular.module('munimapBase')
    .controller('loadSettingsModalController', ['$scope', '$uibModalInstance',
        function($scope, $uibModalInstance) {
            $scope.close = $uibModalInstance.dismiss;

            $scope.registerCallBack = function(){
                $scope.close();
            };

        }
    ])
    .controller('saveSettingsModalController', ['$scope', '$uibModalInstance',
        function($scope, $uibModalInstance) {
            $scope.close = $uibModalInstance.dismiss;

            $scope.registerCallBack = function(){
                $scope.close();
            };
        }
    ]);
