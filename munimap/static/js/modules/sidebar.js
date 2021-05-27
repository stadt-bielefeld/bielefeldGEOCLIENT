angular.module('munimapBase.sidebar', ['anol.map'])

    .directive('sidebar', ['$rootScope', '$location', '$timeout', '$window', 'MapService', 
        function($rootScope, $location, $timeout, $window, MapService) {
            return {
                templateUrl: 'munimap/sidebar.html',
                transclude: true,
                replace: true,
                scope: {
                    // must be an object, otherwise outer scope don't recognise sidebar.open changed
                    'sidebar': '='
                },
                // controller is initialized before transcluded elements
                controller: function($scope) {
                    var self = this;
                    $scope.items = {};
                    $scope.openItems = $location.search().sidebar;
                    if(angular.isUndefined($scope.openItems)) {
                        $scope.openItems = '';
                    }

                    $scope.openSidebar = $location.search().sidebarStatus;
                    if ($window.innerWidth <= 480) {
                        $scope.sidebar.open = false;
                    } else {
                        if ($scope.openSidebar === 'open') {
                            $scope.sidebar.open = true;
                        } else if ($scope.openSidebar === 'closed') {
                            $scope.sidebar.open = false;
                        }
                    }

                    $scope.updateLocationSearch = function() {
                        if(angular.isUndefined($scope.sidebar) || !$scope.sidebar.open) {
                            // $location.search('sidebar', null);
                            $location.search('sidebarStatus', 'closed');
                            $location.replace();
                            return;
                        }
                        var openMenus = [];
                        angular.forEach($scope.items, function(itemScope) {
                            if(!itemScope.collapse) {
                                openMenus.push(itemScope.name);
                            }
                        });
                        $location.search('sidebar', openMenus.join(','));
                        $location.search('sidebarStatus', 'open');
                        $location.replace();
                    };
                    $scope.toggleMenu = function() {
                        $scope.sidebar.open = !$scope.sidebar.open;
                    };

                    $scope.openFeedbackMail = function(mail, subject, body) {
                        var url = encodeURIComponent($window.location.href);
                        return 'mailto:'+mail+'?subject='+subject+'&body='+body+' '+url;
                    };

                    $scope.$watch('sidebar.open', function() {
                        $scope.updateLocationSearch();
                        $timeout(function() {
                            MapService.getMap().updateSize();
                        });
                    });

                    $scope.$on('sidebar.open', function(evt, itemName) {
                        if(angular.isDefined($scope.items[itemName])) {
                            self.openItem(itemName);
                        }
                    });

                    $rootScope.$on('updateSidebar', function(br, data){
                        // close all sidebar items before load new one
                        angular.forEach($scope.items, function(itemScope) {
                            itemScope.close();
                        });
                        if (data.map.sidebar) {
                            $scope.openItems = data.map.sidebar;
                            var openItem = data.map.sidebar;
                            var itemScope = $scope.items[openItem];
                            itemScope.collapse = $scope.openItems.search(openItem) === -1;
                        }
                        var openSidebar = data.map.sidebarStatus;
                        if (openSidebar === 'open') {
                            $scope.sidebar.open = true;
                        } else if (openSidebar === 'closed') {
                            $scope.sidebar.open = false;
                        }
                    });

                    this.registerSidebarItem = function(itemScope) {
                        $scope.items[itemScope.name] = itemScope;
                        itemScope.collapse = $scope.openItems.search(itemScope.name) === -1;
                        $scope.updateLocationSearch();
                    };
                    this.toggleItem = function(name) {
                        var itemScope = $scope.items[name];
                        if(itemScope.exclusive && itemScope.collapse) {
                            angular.forEach($scope.items, function(_itemScope) {
                                _itemScope.collapse = true;
                            });
                        } else if(!itemScope.exclusive && itemScope.collapse) {
                            angular.forEach($scope.items, function(_itemScope) {
                                if(_itemScope.exclusive === true) {
                                    _itemScope.collapse = true;
                                }
                            });
                        }
                        itemScope.collapse = !itemScope.collapse;
                        $scope.updateLocationSearch();
                    };
                    this.openItem = function(name) {
                        var itemScope = $scope.items[name];
                        if(itemScope.collapse === true) {
                            this.toggleItem(name);
                        }
                    };
                    this.closeItem = function(name) {
                        var itemScope = $scope.items[name];
                        if(itemScope.collapse === false) {
                            this.toggleItem(name);
                        }
                    };
                }
            };
        }])

    .directive('sidebarItem', [function() {
        return {
            templateUrl: 'munimap/sidebar-item.html',
            transclude: true,
            replace: true,
            require: '^sidebar',
            scope: {
                'title': '@itemTitle',
                '_exclusive': '@exclusive',
                'name': '@sidebarItem'
            },
            link: function(scope, element, attrs, SidebarController) {
                scope.exclusive = angular.isDefined(attrs.exclusive);
                SidebarController.registerSidebarItem(scope);
                scope.toggle = function() {
                    SidebarController.toggleItem(scope.name);
                };
                scope.open = function() {
                    SidebarController.openItem(scope.name);
                };
                scope.close = function() {
                    SidebarController.closeItem(scope.name);
                };
            }
        };
    }]);