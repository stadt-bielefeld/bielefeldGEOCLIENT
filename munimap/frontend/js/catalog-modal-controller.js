require('angular-ui-bootstrap');

angular.module('munimapBase')
    .controller('catalogModalController', ['Variant', 'ShowLayers', '$scope', '$uibModalInstance',
        function(Variant, ShowLayers, $scope, $uibModalInstance) {
            $scope.close = $uibModalInstance.dismiss;
            $scope.showLayers = ShowLayers;
            $scope.variant = Variant;
        }
    ]);
