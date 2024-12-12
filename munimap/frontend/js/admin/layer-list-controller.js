angular.module('munimapAdmin')
    .controller('LayerListController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.protectedLayers = ModelService.protectedLayers;
        $scope.layers = orderBy(ModelService.layersForList(), 'name');
        $scope.setSubpage(undefined);

        $scope.layerStatus = function(layer) {
            if(layer.missingConfig === true) {
                return 'missing';
            }
            if(angular.isDefined($scope.protectedLayers[layer.name])) {
                return 'protected';
            }
            return 'unprotected';
        };

        $scope.updateOpenStatus = function(layer) {
            layer.isOpen = !layer.isOpen;
        };
    
        $scope.protect = function(layer) {
            ModelService.protectLayer(layer)
                .then(function() {
                    $scope.protectedLayers = ModelService.protectedLayers;
                    $scope.layers = orderBy(ModelService.layersForList(), 'name');
                });
        };

        $scope.unprotect = function(layer) {
            ModelService.unprotectLayer(layer)
                .then(function() {
                    $scope.protectedLayers = ModelService.protectedLayers;
                    $scope.layers = orderBy(ModelService.layersForList(), 'name');
                });
        };
    }]);