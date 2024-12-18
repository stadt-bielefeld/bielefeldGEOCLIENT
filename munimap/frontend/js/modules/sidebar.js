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

                    if (angular.isUndefined($rootScope.sidebar)) {
                        $rootScope.sidebar = {
                            openItems: [],
                            open: false
                        };
                    }

                    if ($window.innerWidth <= 480) {
                        $rootScope.sidebar.open = false;
                    }

                    $rootScope.$watch('sidebar.open', function(isOpen) {
                        if (isOpen) {
                            $window.document.body.classList.add('sidebar-open');
                            $window.document.body.classList.remove('sidebar-closed');
                        } else {
                            $window.document.body.classList.remove('sidebar-open');
                            $window.document.body.classList.add('sidebar-closed');
                        }

                        $timeout(function() {
                            MapService.getMap().updateSize();
                        });
                    });

                    $scope.toggleMenu = function() {
                        $scope.sidebar.open = !$scope.sidebar.open;
                    };

                    $scope.openFeedbackMail = function(mail, subject, body) {
                        var url = encodeURIComponent($window.location.href);
                        return 'mailto:'+mail+'?subject='+subject+'&body='+body+' '+url;
                    };

                    $scope.$on('sidebar.open', function(evt, itemName) {
                        if(angular.isDefined($scope.items[itemName])) {
                            self.openItem(itemName);
                        }
                    });

                    $rootScope.$watch('sidebar.openItems', (openItems) => {
                       angular.forEach($scope.items, itemScope => {
                           itemScope.collapse = openItems.indexOf(itemScope.name) === -1;
                       });
                    });

                    this.registerSidebarItem = function(itemScope) {
                        $scope.items[itemScope.name] = itemScope;
                        itemScope.collapse = $rootScope.sidebar.openItems.indexOf(itemScope.name) === -1;
                    };

                    this.toggleItem = function(name) {
                        var itemScope = $scope.items[name];
                        if (itemScope.exclusive && itemScope.collapse) {
                            angular.forEach($scope.items, function(_itemScope) {
                                _itemScope.collapse = true;
                            });
                        } else if (!itemScope.exclusive && itemScope.collapse) {
                            angular.forEach($scope.items, function(_itemScope) {
                                if(_itemScope.exclusive === true) {
                                    _itemScope.collapse = true;
                                }
                            });
                        }
                        itemScope.collapse = !itemScope.collapse;

                        $rootScope.sidebar.openItems = Object.values($scope.items)
                            .filter(itemScope => !itemScope.collapse)
                            .map(itemScope => itemScope.name);
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
