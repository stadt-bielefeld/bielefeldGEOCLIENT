import 'angular-ui-bootstrap';
import 'angular-schema-form';

angular.module('schemaForm').run(['$templateCache', 
    function($templateCache) {
        $templateCache.put(
            'directives/decorators/bootstrap/plaintext/plaintext.html',
            `<div sf-field-model ng-if="$$value$$" class="form-group munimap-plaintext">
                <label class="control-label">{{form.title}}</label>
                <div class="input-group">
                    <span ng-if="form.format !== 'date'">{{$$value$$}}</span>
                    <span ng-if="form.format === 'date'">{{$$value$$ | date : "dd.MM.yyyy, HH:mm:ss" }}</span>
                </div>
            </div>`
        );
    }
]);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

            var plainText = function(name, schema, options) {
                if (schema.type === 'string' && schema.format === 'plaintext') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'plaintext';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.string.unshift(plainText);

            //Add to the bootstrap directive
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'plaintext',
                'directives/decorators/bootstrap/plaintext/plaintext.html');
            schemaFormDecoratorsProvider.createDirective('plaintext',
                'directives/decorators/bootstrap/plaintext/plaintext.html');
        }]);
