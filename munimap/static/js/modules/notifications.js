angular.module('munimapBase.notification', [])

    .provider('NotificationService', [function() {
        var _timeout;
        this.setTimeout = function(timeout) {
            _timeout = timeout;
        };

        this.$get = ['$timeout', function($timeout) {
            var NotificationService = function(timeout) {
                this.notifications = [];
                this.timeout = timeout || 3000;
            };
            NotificationService.prototype.add = function(msg, type) {
                var self = this;
                var notification = {
                    type: type,
                    msg: msg
                };
                self.notifications.push(notification);
                $timeout(function() {
                    self.remove(notification);
                }, this.timeout);
            };
            NotificationService.prototype.addError = function(msg) {
                this.add(msg, 'error');
            };
            NotificationService.prototype.addInfo = function(msg) {
                this.add(msg, 'info');
            };
            NotificationService.prototype.addSuccess = function(msg) {
                this.add(msg, 'success');
            };
            NotificationService.prototype.remove = function(notification) {
                var idx = this.notifications.indexOf(notification);
                if(idx > -1) {
                    this.notifications.splice(idx, 1);
                }
            };

            return new NotificationService(_timeout);
        }];
    }])

    .directive('notifications', ['NotificationService', function(NotificationService) {
        return {
            template: '<div ng-repeat="notification in notifications"><div ng-click="close(notification)" class="alert" ng-class="{\'alert-info\': notification.type === \'info\', \'alert-danger\': notification.type === \'error\', \'alert-success\': notification.type === \'success\'}">{{ notification.msg }}</div></div>',
            link: function(scope) {
                scope.notifications = NotificationService.notifications;
                scope.close = function(notification) {
                    NotificationService.remove(notification);
                };
            }
        };
    }]);
