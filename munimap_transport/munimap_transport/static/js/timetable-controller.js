angular.module('munimapBase')
    .controller('TimetableController', ['$scope', function($scope) {
        $scope.addCharset = function(charset) {
           // add charset to document to send umlauts correct
           // using the ie - for other browser document.charset is read only
           document.charset = charset;
        };
    }]);
