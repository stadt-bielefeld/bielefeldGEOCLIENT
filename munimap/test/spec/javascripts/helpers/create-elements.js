var createSidebar = function($compile, $scope) {
    var element = angular.element('<div sidebar="sidebar"></div>');
    var item1 = angular.element('<div sidebar-item="item1" item-title="Item 1">Item 1 content</div>');
    var item2 = angular.element('<div sidebar-item="item2" item-title="Item 2">Item 2 content</div>');
    element.append(item1).append(item2);
    var compiledElement = $compile(element)($scope);
    $scope.$digest();
    return compiledElement;
};

var createNotificationElement = function($compile, $scope) {
    var element = angular.element('<div class="notifications" notifications></div>');
    var compiledElement = $compile(element)($scope);
    $scope.$digest();
    return compiledElement;
};
