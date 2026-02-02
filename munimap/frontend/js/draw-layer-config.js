import 'angular-ui-bootstrap';
import 'angular-schema-form';
import 'angular-schema-form-bootstrap';

angular.module('munimapDraw', [
    'schemaForm',
    'ui.bootstrap-slider',
    'angularSpectrumColorpicker',
    'munimapBase.confirm'
])

    .value('StyleSchema', undefined)
    .value('StyleSchemaFormOptions', undefined)
    .value('LabelSchema', undefined)
    .value('LabelSchemaFormOptions', undefined)

    .constant('DefaultStyle', {
        'radius': 5,
        'graphicRotation': 0,
        'strokeWidth': 2,
        'strokeColor': '#3399cc',
        'strokeOpacity': 1,
        'strokeDashstyle': 'solid',
        'fillColor': '#fff',
        'fillOpacity': 0.4,
        'fontColor': '#333',
        'fontSize': '10px',
        'fontWeight': 'normal',
        'fontRotation': 0,
    })

    .constant('ColorpickerPalette', [
        'rgb(255, 255, 255);',
        'rgb(0, 255, 255);',
        'rgb(0, 255, 0);',
        'rgb(255, 255, 0);',
        'rgb(255, 0, 0);',
        'rgb(255, 102, 0);',
        'rgb(0, 38, 128);',
        'rgb(96, 124, 191);',
        'rgb(89, 255, 255);',
        'rgb(0, 128, 255);',
        'rgb(0, 102, 0);',
        'rgb(133, 41, 204);',
        'rgb(255, 128, 0);',
        'rgb(204, 0, 51);',
        'rgb(0, 0, 0);',
        'rgb(102, 102, 102);',
        'rgb(153, 153, 153);'
    ])

    .run([
        'LayersService', 'DrawService', 'DefaultStyle', 'ColorpickerPalette', 'munimapConfig',
        'StyleSchema', 'StyleSchemaFormOptions', 'LabelSchema', 'LabelSchemaFormOptions', 'DrawIconsPrefix',
        function(LayersService, DrawService, DefaultStyle, ColorpickerPalette, munimapConfig,
            StyleSchema, StyleSchemaFormOptions, LabelSchema, LabelSchemaFormOptions, DrawIconsPrefix) {

            if(!!munimapConfig.components.draw || !!munimapConfig.components.geoeditor) {
                var drawLayer = new anol.layer.Feature({
                    title: 'DrawLayer',
                    name: 'draw_layer',
                    styleSchema: StyleSchema,
                    styleSchemaFormOptions: StyleSchemaFormOptions,
                    labelSchema: LabelSchema,
                    labelSchemaFormOptions: LabelSchemaFormOptions,
                    editable: true,
                    displayInLayerswitcher: false,
                    permalink: false,
                    externalGraphicPrefix: DrawIconsPrefix,
                    olLayer: {
                        zIndex: 1000
                    }
                });
                drawLayer.olLayer = LayersService.createOlLayer(drawLayer);
                LayersService.addSystemLayer(drawLayer);
                DrawService.addLayer(drawLayer);
                DrawService.changeLayer(drawLayer);
            }
        }
    ]);
