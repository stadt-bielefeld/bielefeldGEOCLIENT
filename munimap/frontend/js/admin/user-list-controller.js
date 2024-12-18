angular.module('munimapAdmin')
    .controller('UserListController', ['$scope', 'orderByFilter', 'ModelService', 
        function($scope, orderBy, ModelService) {

            $scope.orderByCol = 'name';
            $scope.users = orderBy(ModelService.users, $scope.orderByCol);
            $scope.reverse = false;

            $scope.setSubpage(undefined);

            $scope.sortByColumn = function(col) {
                if (col === $scope.orderByCol) {
                    $scope.reverse = !$scope.reverse;
                }
                $scope.orderByCol = col;
                $scope.users = orderBy(
                    ModelService.users, 
                    $scope.orderByCol, 
                    $scope.reverse);
            };

            $scope.removeUser = function(group) {
                ModelService.removeUser(group)
                    .then(function() {
                        $scope.users = orderBy(ModelService.users, $scope.orderByCol);
                    });
            };
        }]);