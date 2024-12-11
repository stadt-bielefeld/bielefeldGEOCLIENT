import 'bootstrap3/js/tooltip.js';
import 'bootstrap3/js/popover.js';
import './bootstrap-confirmation.js';

angular.module('munimapBase.confirm', [])

    .directive('confirm', [function() {
        return {
            restrict: 'E',
            template: '<a class="{{ class }}">{{ text }} <i ng-if="icon" class="{{ icon }}"/></a>',
            transclude: true,
            replace: true,
            scope: {
                class: '@',
                onConfirm: '&',
                confirmTitle: '@',
                placement: '@',
                okLabel: '@',
                cancelLabel: '@',
                icon: '@',
                text: '@'
            },
            link: function(scope, element) {
                var tpl = '';
                tpl += '<div class="popover">';
                tpl += '  <div class="arrow"></div>';
                tpl += '  <h3 class="popover-title"></h3>';
                tpl += '  <div class="popover-content btn-group">';
                tpl += '    <a data-apply="confirmation">Yes</a>';
                tpl += '    <a data-dismiss="confirmation">No</a>';
                tpl += '  </div>';
                tpl += '</div>';
                $(element).confirmation({
                    href: null,
                    title: scope.confirmTitle,
                    placement: scope.placement,
                    btnOkLabel: scope.okLabel,
                    btnOkIcon: 'glyphicon glyphicon-ok text-white',
                    btnCancelLabel: scope.cancelLabel,
                    template: tpl,
                    onConfirm: function() {
                        scope.$apply(function() {
                            scope.onConfirm({});
                        });
                    }
                });
            }
        };
    }]);