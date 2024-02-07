require('spectrum-colorpicker');
require('angular-spectrum-colorpicker');
require('angular-schema-form');

angular.module('schemaForm').run(['$templateCache',
    function($templateCache) {
        $templateCache.put('directives/decorators/bootstrap/colorpicker/colorpicker.html',
            `<div class="form-group" ng-class="{\'has-error\': hasError()}">
  <label class="control-label" ng-show="showTitle()">{{form.title}}</label>
  <div ng-init="defaultSpectrumOptions = {
    showInput: true,
    showAlpha: true,
    allowEmpty: true,
    showPalette: true,
    preferredFormat: form.colorFormat || \'rgb\',
    palette: [[\'#fce94f\', \'#fcaf3e\', \'#e9b96e\'], [\'#8ae234\', \'#729fcf\', \'#ad7fa8\'], [\'#ef2929\', \'#888a85\', \'#deface\']]
  }">
    <spectrum-colorpicker
      ng-model="$$value$$"
      format="form.colorFormat || \'rgb\'"
      style="background-color: white"
      type="color"
      schema-validate="form"
      options="form.spectrumOptions || defaultSpectrumOptions"></spectrum-colorpicker>
</div>
  <span class="help-block">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>
</div>`);}]);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function(schemaFormProvider,  schemaFormDecoratorsProvider, sfPathProvider) {

            var colorpicker = function(name, schema, options) {
                if (schema.type === 'string' && schema.format === 'color') {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key  = options.path;
                    f.type = 'colorpicker';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.string.unshift(colorpicker);

            //Add to the bootstrap directive
            schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'colorpicker',
                'directives/decorators/bootstrap/colorpicker/colorpicker.html');
            schemaFormDecoratorsProvider.createDirective('colorpicker',
                'directives/decorators/bootstrap/colorpicker/colorpicker.html');
        }]);
