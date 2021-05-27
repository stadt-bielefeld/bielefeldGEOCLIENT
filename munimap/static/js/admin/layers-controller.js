angular.module('munimapAdmin')
    .controller('LayersController', ['$scope', '$route', '$routeParams', '$timeout', 'orderByFilter', 'ModelService', function($scope, $route, $routeParams, $timeout, orderBy, ModelService) {
        $scope.layers = orderBy(ModelService.protectedLayersList, 'name');
        $scope.selectedLayer = undefined;

        $scope.availableGroups = [];
        $scope.assignedGroups = [];

        $scope.setSubpage('layer-groups');

        $scope.selectLayer = function(layer) {
            $scope.selectedLayer = layer;
            $timeout(function() {
            // wraped in timeout, otherwise selected group is not highlighted immediately
                $route.updateParams({'id': $scope.selectedLayer.id});
                $scope.updateGroupLists();
            });
        };

        $scope.updateGroupLists = function() {
            if(angular.isUndefined($scope.selectedLayer)) {
                $scope.availableGroups = [];
                $scope.assignedGroups = [];
                return;
            }
            var lists = ModelService.groupsListsForLayer($scope.selectedLayer);
            $scope.availableGroups = orderBy(lists.availableGroups, 'name');
            $scope.assignedGroups = orderBy(lists.assignedGroups, 'name');
        };

        $scope.assignGroup = function(group) {
            var promise = ModelService.assignLayerToGroup(group, $scope.selectedLayer);
            promise.then($scope.updateGroupLists);
        };

        $scope.deassignGroup = function(group) {
            var promise = ModelService.deassignLayerFromGroup(group, $scope.selectedLayer);
            promise.then($scope.updateGroupLists);
        };

        if(angular.isDefined($routeParams.id)) {
            var element = ModelService.layerById(parseInt($routeParams.id));
            if(angular.isDefined(element)) {
                $scope.selectedLayer = element;
                $scope.updateGroupLists();
                $scope.scrollToActive(angular.element('#layer-list'));
            }
        }
    }]);