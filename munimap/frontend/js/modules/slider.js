
angular.module('schemaForm').run(['$templateCache', function($templateCache) {
    $templateCache.put(
        'directives/decorators/bootstrap/slider/slider.html',
        /*jshint multistr: true */
        '<div class="form-group {{ form.htmlClass }}" \
          ng-class="{\'has-error\': hasError()}"> \
      <span class="slider-value-label pull-right" \
            ng-switch="form.sliderOptions.format">\
        <span ng-switch-when="percent">{{ model[form.key] * 100 | number:0 }}</span>\
        <span ng-switch-default>{{ model[form.key] }}</span> \
        {{ form.sliderOptions.unit }}\
      </span>\
      <label class="control-label" \
             ng-show="showTitle()">{{ form.title }}</label>\
      <input name="{{ form.key[0] }}" \
             class="hidden" \
             sf-field-model \
             ng-model="model[form.key]" \
             type="number">\
      <div ng-init="defaultSliderOptions = { \
                     min: 0, \
                     step: 0.1, \
                     max: 1, \
                     handle: \'custom\' \
      }">\
        <span slider \
              tooltip="hide" \
              ng-model="model[form.key]" \
              value="model[form.key]" \
              handle="form.sliderOptions.handle || defaultSliderOptions.handle" \
              min="form.sliderOptions.min || defaultSliderOptions.min" \
              step="form.sliderOptions.step || defaultSliderOptions.step" \
              max="form.sliderOptions.max || defaultSliderOptions.max">\
        </span>\
      </div>\
    </div>'
    );
}]);

angular.module('schemaForm').config(
    ['schemaFormDecoratorsProvider', 'sfBuilderProvider',
        function(schemaFormDecoratorsProvider, sfBuilderProvider) {
            schemaFormDecoratorsProvider.defineAddOn(
                'bootstrapDecorator',
                'slider',
                'directives/decorators/bootstrap/slider/slider.html',
                sfBuilderProvider.stdBuilders
            );
        }]);
