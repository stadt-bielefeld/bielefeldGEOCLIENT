require('angular-ui-bootstrap');
require('angular-schema-form');

angular.module('schemaForm').run(['$templateCache', 
    function($templateCache) {
        $templateCache.put(
            'directives/decorators/bootstrap/datepicker/datepicker.html',
            '<div ng-controller="datepickerController" class="form-group munimap-datepicker" ng-class="{\'has-error\': hasError()}"><div class="input-group"> <label class="control-label" ng-show="showTitle()">{{form.title}}</label> <input type="text" class="form-control" sf-field-model="replaceAll" uib-datepicker-popup="{{format}}" datepicker-append-to-body="true" clear-text="Leeren" close-text="Schließen" current-text="Heute" ng-model="dt" datepicker-options="datepickerOptions" is-open="datepickerOpen"/> <span class="input-group-btn"> <button type="button" class="btn btn-default" ng-click="openDatepicker()"> <i class="glyphicon glyphicon-calendar"></i> </button> </span> </div> </div>'
        );
    }
]);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

            var datepicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format == 'date') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'datepicker';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.string.unshift(datepicker);

            //Add to the bootstrap directive
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'datepicker',
                'directives/decorators/bootstrap/datepicker/datepicker.html');
            schemaFormDecoratorsProvider.createDirective('datepicker',
                'directives/decorators/bootstrap/datepicker/datepicker.html');
        }]);

angular.module('schemaForm')
    .controller('datepickerController', ['$scope', function($scope) {
        $scope.datepickerOpen = false;
        $scope.format = 'dd.MM.yyyy';
        $scope.openDatepicker = function () {
          $scope.datepickerOpen = true;
        }

        var dt = $scope.model[$scope.form.key[0]];
        $scope.dt = dt ? new Date(dt) : undefined;

        $scope.datepickerOptions = {
          showWeeks: false,
          ngModelOptions: {
            timezone: 'UTC'
          }
        };
        $scope.$watch('dt', function(newValue, _, scope) {
          if (newValue) {
            scope.model[scope.form.key[0]] = newValue.toISOString();
          }
        });
    }]);
