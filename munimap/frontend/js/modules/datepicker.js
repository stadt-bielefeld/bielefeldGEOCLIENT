import 'angular-ui-bootstrap';
import 'angular-schema-form';

angular.module('schemaForm').run(['$templateCache',
    function($templateCache) {
        $templateCache.put(
            'directives/decorators/bootstrap/datepicker/datepicker.html',
            `<div class="form-group munimap-datepicker" ng-class="{\'has-error\': hasError()}">
  <label class="control-label" ng-show="showTitle()">{{form.title}}</label>
  <div class="input-group">
    <anol-date-picker class="anol-date-picker" date="$$value$$" />
  </div>
</div>`);
    }
]);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

            var datepicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format === 'date') {
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
