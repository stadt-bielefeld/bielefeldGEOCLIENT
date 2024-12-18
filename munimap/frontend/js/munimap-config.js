require('angular-ui-switch');

import GeoJSON from 'ol/format/GeoJSON';

angular.module('munimap', [
    'schemaForm',
    'anol.datepicker',
    'anol.geolocation',
    'anol.getfeatureinfo',
    'anol.measure',
    'anol.overviewmap',
    'anol.print',
    'anol.scale',
    'anol.urlmarkers',
    'anol.featurepropertieseditor',
    'anol.savemanager',
    'munimapDraw',
    'munimapGeoeditor',
    'munimapDigitize',
    'munimapBase.moveableModal',
    'munimapBase.alkisButton',
    'munimapBase.alkisSimple',
    'munimapBase.alkisPdf',
    'munimapBase.alkisSelection',
    'munimapBase.alkisOfficial',
    'uiSwitch'
])

    .config(['PrintServiceProvider', 'PrintPageServiceProvider', 'munimapConfig',
        function(PrintServiceProvider, PrintPageServiceProvider, munimapConfig) {
            if(
                (angular.isUndefined(munimapConfig.components.print) || munimapConfig.components.print === false) &&
                (angular.isUndefined(munimapConfig.components.geoeditor) || munimapConfig.components.geoeditor === false)
            ) {
                return;
            }

            var px2mm = function(px) {
                return (px / 72) * 25.4;
            };

            var format = new GeoJSON();

            var preparePrintArgs = function(rawPrintArgs) {
                var layers = [];
                var indexLayers = [];
                var backgroundLayers = [];
                var overlayLayers = [];
                var otherLayers = [];
                var featureCollection;
                if(rawPrintArgs.templateValues.streetIndex === true) {
                    indexLayers.push(streetIndexLayer);
                }
                angular.forEach(rawPrintArgs.layers, function(layer) {
                    if(layer === undefined) {
                        return;
                    }
                    if(layer.name === 'printOfficalInfoLayer') {
                        return;
                    }
                    if(layer.name === 'draw_layer') {
                        var features = layer.getFeatures();
                        featureCollection = features.length > 0 ? format.writeFeaturesObject(layer.getFeatures()) : featureCollection;
                    } else {
                        if (layer.isBackground) {
                            backgroundLayers.push(layer.name);
                        } else if (!layer.isVector) {
                            overlayLayers.push(layer.name);
                        } else {
                            otherLayers.push(layer.name);
                        }
                    }
                    if(layer instanceof anol.layer.DynamicGeoJSON && layer.options.createIndex === true) {
                        indexLayers.push(layer.name);
                    }
                });

                layers = backgroundLayers.concat(overlayLayers.reverse()).concat(otherLayers);

                var srs = parseInt(rawPrintArgs.projection.split(':')[1]);
                var scale = parseFloat(rawPrintArgs.templateValues.scale);
                var printArgs = {
                    bbox: rawPrintArgs.bbox,
                    scale: scale,
                    output_format: rawPrintArgs.templateValues.outputFormat.value,
                    mimetype: rawPrintArgs.templateValues.outputFormat.mimetype,
                    fileEnding: rawPrintArgs.templateValues.outputFormat.fileEnding,
                    pageLayout: rawPrintArgs.templateValues.layout,
                    pageSize: rawPrintArgs.templateValues.pageSize,
                    srs: srs,
                    layers: layers,
                    indexLayers: indexLayers,
                    measure_feature_collection: rawPrintArgs.measure_feature_collection,
                    cells: [
                        rawPrintArgs.templateValues.cellsX,
                        rawPrintArgs.templateValues.cellsY
                    ],
                    feature_collection: featureCollection
                };
                if ('printMode' in rawPrintArgs) {
                    printArgs.printMode = rawPrintArgs.printMode
                }
                return printArgs;
            };

            var printConfig = munimapConfig.printConfig;
            PrintServiceProvider.setMode(printConfig.mode || 'queue');
            PrintServiceProvider.setCheckUrlAttribute(printConfig.checkUrl);
            PrintServiceProvider.setDownloadUrlAttribute('downloadURL');
            PrintServiceProvider.setPrintUrl(printConfig.printUrl);
            PrintServiceProvider.setDownloadPrefix(printConfig.downloadPrefix);

            PrintServiceProvider.setPreparePrintArgs(preparePrintArgs);

            PrintServiceProvider.setDownloadReady(function(response) {
                if(response.data.status === 'finished') {
                    return response.data.downloadURL;
                }
                return false;
            });


            var pageLayouts = [];
            angular.forEach(printConfig.pageLayouts, function(pageLayout) {
                var layout = printConfig.availablePageLayouts[pageLayout];
                var mapElementSize = layout.mapElementSize;
                // mapElementSize is in px (72 dpi)
                // PrintPageService needs mm
                layout.mapSize = mapElementSize.map(function(x) {
                    return px2mm(x);
                });
                delete layout.mapElementSize;
                layout.layout = pageLayout;
                pageLayouts.push(layout);
            });

            PrintPageServiceProvider.setPageLayouts(pageLayouts);
            PrintPageServiceProvider.setOutputFormats(printConfig.outputFormats);
            PrintPageServiceProvider.setDefaultScale(printConfig.defaultScale);
            PrintPageServiceProvider.setAvailableScales(printConfig.availableScales);
            PrintPageServiceProvider.setStyle(printConfig.style);
            PrintPageServiceProvider.setPageResize(printConfig.pageResize);
            PrintPageServiceProvider.setMinPageSize(px2mm(printConfig.minPageSize));
            PrintPageServiceProvider.setMaxPageSize(px2mm(printConfig.maxPageSize));

            var pageMargins = [];
            angular.forEach(printConfig.pageMargins, function(margin) {
                pageMargins.push(px2mm(margin));
            });
            PrintPageServiceProvider.setPageMargins(pageMargins);
        }])
    .config(['SaveManagerServiceProvider',
        function(SaveManagerServiceProvider) {
            SaveManagerServiceProvider.setSaveNewFeaturesUrl(digitizeSaveNewFeaturesUrl);
            SaveManagerServiceProvider.setSaveChangedFeaturesUrl(digitizeSaveChangedFeaturesUrl);
            SaveManagerServiceProvider.setSaveRemovedFeaturesUrl(digitizeSaveRemovedFeaturesUrl);
            SaveManagerServiceProvider.setPollingUrl(digitizePollingUrl);
            SaveManagerServiceProvider.setPollingInterval(digitizePollingInterval);
        }]);
