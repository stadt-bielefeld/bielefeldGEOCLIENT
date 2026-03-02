import 'angular-route';
import 'ace-builds/src-min-noconflict/ace.js';
import 'ace-builds/src-min-noconflict/ext-searchbox.js';
import 'ace-builds/src-min-noconflict/mode-yaml.js';
import 'ace-builds/src-min-noconflict/mode-javascript.js';
import 'ace-builds/src-min-noconflict/mode-html.js';
import 'ace-builds/src-min-noconflict/worker-javascript.js';
import 'ace-builds/src-min-noconflict/worker-yaml.js';
import 'ace-builds/src-min-noconflict/worker-html.js';
import 'ace-builds/src-min-noconflict/theme-textmate.js';
import 'angular-ui-ace';
import 'angular-ui-bootstrap';
require('./../modules/notifications.js');
require('./../modules/confirm.js');

Date.prototype.ddmmyyyy = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [
        (dd>9 ? '' : '0') + dd, '.',
        (mm>9 ? '' : '0') + mm, '.',
        this.getFullYear()
    ].join('');
};


angular.module('munimapAdmin', ['ngRoute', 'munimapBase.notification', 'munimapBase.confirm', 'ui.ace', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: true
        });
        $routeProvider
            .when('/groups/', {
                templateUrl: 'groups.html',
                controller: 'GroupsController',
                reloadOnSearch: false
            })
            .when('/groups/add', {
                templateUrl: 'group-form.html',
                controller: 'GroupFormController',
                reloadOnSearch: false
            })
            .when('/groups/edit/:groupId', {
                templateUrl: 'group-form.html',
                controller: 'GroupFormController',
                reloadOnSearch: false
            })
            .when('/groups/list', {
                templateUrl: 'group-list.html',
                controller: 'GroupListController',
                reloadOnSearch: false
            })
            .when('/layers/', {
                templateUrl: 'layers.html',
                controller: 'LayersController',
                reloadOnSearch: false
            })
            .when('/layers/list', {
                templateUrl: 'layer-list.html',
                controller: 'LayerListController',
                reloadOnSearch: false
            })
            .when('/projects/', {
                templateUrl: 'projects.html',
                controller: 'ProjectsController',
                reloadOnSearch: false
            })
            .when('/projects/add', {
                templateUrl: 'project-edit.html',
                controller: 'ProjectEditController',
                reloadOnSearch: false
            })
            .when('/projects/edit/:projectName', {
                templateUrl: 'project-edit.html',
                controller: 'ProjectEditController',
                reloadOnSearch: false
            })
            .when('/projects/list', {
                templateUrl: 'project-list.html',
                controller: 'ProjectListController',
                reloadOnSearch: false
            })
            .when('/users/', {
                templateUrl: 'users.html',
                controller: 'UsersController',
                reloadOnSearch: false
            })
            .when('/users/list', {
                templateUrl: 'user-list.html',
                controller: 'UserListController',
                reloadOnSearch: false
            })
            .when('/users/add', {
                templateUrl: 'user-add.html',
                controller: 'UserEditController',
                reloadOnSearch: false
            })
            .when('/users/edit/:userId', {
                templateUrl: 'user-edit.html',
                controller: 'UserEditController',
                reloadOnSearch: false
            })
            .when('/users/duplicate/:userId', {
                templateUrl: 'user-duplicate.html',
                controller: 'UserDuplicateController',
                reloadOnSearch: false
            })
            .when('/maps/list', {
                templateUrl: 'maps-list.html',
                controller: 'MapsListController',
                reloadOnSearch: false
            })
            .when('/maps/add', {
                templateUrl: 'maps-edit.html',
                controller: 'MapsEditController',
                reloadOnSearch: false
            })
            .when('/maps/edit/:configName', {
                templateUrl: 'maps-edit.html',
                controller: 'MapsEditController',
                reloadOnSearch: false
            })
            .when('/logs/alkis', {
                templateUrl: 'alkis-logs.html',
                controller: 'LogsListController',
                reloadOnSearch: false
            })
            .when('/selectionlists/list', {
                templateUrl: 'selectionlists-list.html',
                controller: 'SelectionlistListController',
                reloadOnSearch: false
            })
            .when('/selectionlists/add', {
                templateUrl: 'selectionlists-edit.html',
                controller: 'SelectionlistEditController',
                reloadOnSearch: false
            })
            .when('/selectionlists/edit/:configName', {
                templateUrl: 'selectionlists-edit.html',
                controller: 'SelectionlistEditController',
                reloadOnSearch: false
            })
            .when('/plugins/list', {
                templateUrl: 'plugins-list.html',
                controller: 'PluginListController',
                reloadOnSearch: false
            })
            .when('/plugins/add', {
                templateUrl: 'plugins-edit.html',
                controller: 'PluginEditController',
                reloadOnSearch: false
            })
            .when('/plugins/edit/:configName', {
                templateUrl: 'plugins-edit.html',
                controller: 'PluginEditController',
                reloadOnSearch: false
            })
            .when('/site_contents/list', {
                templateUrl: 'site-contents-list.html',
                controller: 'SiteContentsListController',
                reloadOnSearch: false
            })
            .when('/site_contents/edit/:configName', {
                templateUrl: 'site-contents-edit.html',
                controller: 'SiteContentsEditController',
                reloadOnSearch: false
            })
            .otherwise('/groups');
    }])

    .controller('baseController', ['$scope', '$route', '$routeParams', '$location', '$timeout', '$window', function($scope, $route, $routeParams, $location, $timeout, $window) {
        $scope.$route = $route;
        $scope.location = $location;
        $scope.$routeParams = $routeParams;
        $scope.subpage = undefined;
        $scope.showSubpageNav = false;

        var cssPropertyAsFloat = function(targetElement, property) {
            return parseFloat(targetElement.css(property).replace(/[^-\d\.]/g, ''));
        };

        $scope.scrollToActive = function(listElement) {
            $timeout(function() {
                var active = listElement.find('.active');
                listElement.scrollTop(active.offset().top - listElement.offset().top);
            });
        };

        $scope.scrollToListElement = function(name) {
            return $timeout(function() {
                var trElement = angular.element('tr#' + name);
                var tableElement = angular.element('table');
                angular.element('body').scrollTop(trElement.offset().top - tableElement.offset().top);
            });
        };
        $scope.highlightListElement = function(name) {
            $timeout(function() {
                var trElement = angular.element('tr#' + name);
                trElement.addClass('highlight');
                $timeout(function() {
                    trElement.removeClass('highlight');
                }, 500);
            });
        };

        $scope.showLayer = function(layer) {
            $location.path('/layers/list').search({});
            $scope.scrollToListElement(layer.name).then(function() {
                $scope.highlightListElement(layer.name);
            });
        };

        $scope.showProject = function(project) {
            $location.path('/projects/list');
            $scope.scrollToListElement(project.name).then(function() {
                $scope.highlightListElement(project.name);
            });
        };

        $scope.setSubpage = function(subpage) {
            $scope.subpage = subpage + '.html';
            $scope.showSubpageNav = angular.isDefined(subpage) && subpage.indexOf('-groups') === -1;
            if($scope.showSubpageNav)  {
                $location.search({
                    tab: subpage.split('-')[1]
                });
            }
        };

        var calculateContainerMaxHeight = function() {
            var firstContainer = angular.element('.element-container-content').first();
            if(firstContainer.length === 0) {
                return;
            }
            var height = $window.innerHeight;
            height -= firstContainer.offset().top;
            height -= cssPropertyAsFloat(firstContainer, 'margin-bottom');
            height -= 34; // manage-button
            height -= 20; // padding-bottom
            $scope.containerMaxHeight =  height;
        };

        $scope.path = $location.path();
        $scope.$watch(function() {
            return $location.path();
        }, function() {
            $scope.path = $location.path();
            $scope.listSearch = undefined;
            $timeout(calculateContainerMaxHeight);
        });

        angular.element($window).resize(function() {
            $scope.$apply(calculateContainerMaxHeight);
        });
        $timeout(calculateContainerMaxHeight);
    }]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['munimapAdmin']);
});
