require('angular');
require('angular-ui-bootstrap');
require('angular-schema-form');
require('angular-schema-form-bootstrap');

require('./../../../../munimap/static/js/modules/colorpicker.js');
require('./../../../../munimap/static/js/modules/slider.js');
require('./../../../../munimap/static/js/modules/slider-directive.js');
require('./../../../../munimap/static/js/modules/notifications.js');

angular.module('munimap', ['munimapBase.notification', 'schemaForm', 'ui.bootstrap', 'ui.bootstrap-slider'])

    .controller('baseController', function() {})

    .controller('ModalController', ['$scope', '$uibModal', function($scope, $modal) {
        $scope.openDeleteModal = function(targetUrl, modalText) {
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'confirm-delete-modal.html',
                controller: 'DeleteModalInstanceController',
                resolve: {
                    targetUrl: function() {
                        return targetUrl;
                    },
                    modalText: function() {
                        return modalText;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.selected = selectedItem;
            }, function () {
                angular.noop();
            });
        };
    }])

    .controller('DeleteModalInstanceController', ['$scope', '$uibModalInstance', 'targetUrl', 'modalText', function($scope, $modalInstance, targetUrl, modalText) {
        $scope.targetUrl = targetUrl;
        $scope.modalText = modalText;
        $scope.ok = function() {
            $uibModalInstance.close();
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        };
    }]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['munimap']);
});