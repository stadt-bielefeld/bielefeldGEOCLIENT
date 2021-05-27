/**
 * @name anol
 * @version 0.0.1
 * @description
 * Framework to create a cool map with AngularJS, Bootstrap and OpenLayers3
 * Created at 2018-05-04
 * Revision 59385c7
 */
/**
 * @ngdoc overview
 * @name anol
 * @description
 * Wrapper namespace
 */
var anol = anol || {};
anol.helper = anol.helper || {};
anol.geocoder = anol.geocoder || {};
anol.layer = anol.layer || {};
anol.control = anol.control || {};
;
anol.helper = {
    /**
     * Returns v or d if v undefined
     */
    getValue: function(v, d) {
        return v === undefined ? d : v;
    },
    /**
     * Returns a without elements of b
     */
    excludeList: function(a, b) {
        var r = a.filter(function(e) {
            return b.indexOf(e) < 0;
        });
        return r;
    },
    /**
     * Returns true when all elements of b in a otherwise false
     */
    allInList: function(a, b) {
        if(b.length === 0) {
            return false;
        }
        for(var i = 0; i < b.length; i++) {
            if(a.indexOf(b[i]) < 0) {
                return false;
            }
        }
        return true;
    },
    /**
     * Returns distinct list of a and b
     */
    concatDistinct: function(a, b) {
        r = a.slice();
        for(var i = 0; i < b.length; i++) {
            if(r.indexOf(b[i]) < 0) {
                r.push(b[i]);
            }
        }
        return r;
    },
    /**
     * Inserts content of array by into array a starting at position at.
     * When at is undefined, append b to a
     */
    concat: function(a, b, at) {
        if(at !== undefined) {
            a.splice.apply(a, [at, 0].concat(b));
        } else {
            a = a.concat(b);
        }
        return a;
    },
    /**
     * Returns string splitted into parts but prevents list with empty string
     */
    stringSplit: function(v, s) {
        var r = v.split(s);
        if(r.length === 1 && r[0] === "") {
            return [];
        }
        return r;
    },
    mergeObjects: function(a, b) {
        var keys = Object.keys(b || {});
        for(var i = 0; i < keys.length; i++) {
            var key  = keys[i];
            if(a[key] === undefined) {
                a[key] = b[key];
                continue;
            }
            if(a[key] instanceof Array) {
                a[key] = anol.helper.concat(a[key], b[key]);
                continue;
            }
            if(a[key] instanceof Object) {
                a[key] = anol.helper.mergeObjects(a[key], b[key]);
                continue;
            }
            a[key] = b[key];
        }
        return a;
    }
};
;
/**
 * @ngdoc object
 * @name anol.layer.Layer
 *
 * @param {Object} options AnOl Layer options
 * @param {string} options.title Layer title
 * @param {string} options.displayInLayerswitcher Show in layerswitcher
 * @param {boolean} options.permalink Add layer to permalink url. Default true. When displayInLayerswitcher is false, permalink is always false.
 * @param {boolean} options.isBackgorund Define layer as background layer
 * @param {Object} options.featureinfo Stores informations for feature info
 * @param {string} options.featureinfo.target Target of *GetFeatureInfo* request for {@link api/anol.featureinfo anol.featureinfo}. Supported values are:
 * - *_popup* - Results displayed in a popup
 * - *_blank* - Results displayed in a new window/tab
 * - *[id]* - Id of html element to display results in
 * @param {Array<string>} options.featureinfo.properties List of feature properties to show in {@link api/anol.featurepopup anol.featurepopup}.
 * @param {nu,ber} options.featureinfo.featureCount FEATURE_COUNT parameter for getFeatureInfo requests
 * @param {Object} options.legend Stores informations for legend
 * @param {string} options.legend.type Type of legend entry. Supported values are:
 * - *point* - Extracts point style of vector layer for legend
 * - *line* - Extracts line style of vector layer for legend
 * - *polygon* - Extracts polygon style of vector layer for legend
 * - *GetLegendGraphic* - Use options.legend.url for legend
 * @param {string} options.legend.url Url to image for display in legend
 * @param {string} otpions.legend.target Id of html element to display legend image in. (Only for options.legend.type == 'GetLegendGraphic').
 *                                       If empty, legend image is shown in legend control
 * @param {Object} options.olLayer OpenLayers layer object
 *
 * @description
 * Object for wrapping ol3 layers and add properties to them
 * You can create a normal ol3 layer and give it to a anol.layer.Layer
 *
 * @example
 * ```js
 *   // create ol layer
 *   var olLayer = new ol.layer.Vector({
 *     source: new ol.source.Vector()
 *   });
 *   var anolLayer = new anol.layer.Layer({
 *     title: "Awesome layer",
 *     olLayer: olLayer
 *   });
 * ```
 */
anol.layer.Layer = function(options) {
    if(options === false) {
        return;
    }
    options = $.extend(true, {}, this.DEFAULT_OPTIONS, options);
    this.name = options.name;
    this.title = options.title;
    this.isBackground = options.isBackground || false;
    this.featureinfo = options.featureinfo || false;
    this.legend = options.legend || false;
    this.attribution = options.attribution || undefined;
    this.isVector = false;
    this.options = options;
    this.displayInLayerswitcher = anol.helper.getValue(options.displayInLayerswitcher, true);
    this._controls = [];
    this.combined = false;

    if(this.displayInLayerswitcher === false) {
        this.permalink = false;
    } else {
        this.permalink = anol.helper.getValue(options.permalink, true);
    }

    // keep ability to create anol.layer.Layer with predefined olLayer
    // this is needed for system layers in measure/print/etc.
    if(options.olLayer instanceof ol.layer.Base) {
        this.olLayer = options.olLayer;
    } else {
        this.olSourceOptions = this._createSourceOptions(options.olLayer.source);
        delete options.olLayer.source;
        this.olLayerOptions = options.olLayer;
        this.olLayer = undefined;
    }
};

anol.layer.Layer.prototype = {
    CLASS_NAME: 'anol.layer.Layer',
    OL_LAYER_CLASS: undefined,
    OL_SOURCE_CLASS: undefined,
    DEFAULT_OPTIONS: {
        olLayer: {
            source: {}
        }
    },
    setOlLayer: function(olLayer) {
        this.olLayer = olLayer;
    },
    removeOlLayer: function() {
        delete this.olLayer;
    },
    isCombinable: function(other) {
        if(other.CLASS_NAME !== this.CLASS_NAME) {
            return false;
        }
        return true;
    },
    isClustered: function() {
        return false;
    },
    getCombinedSource: function(other) {
        return undefined;
    },
    removeFromCombinedSource: function() {},
    getVisible: function() {
        if(this.olLayer === undefined) {
            return false;
        }
        return this.olLayer.getVisible();
    },
    setVisible: function(visible)  {
        this.olLayer.setVisible(visible);
        $(this).triggerHandler('anol.layer.visible:change', [this]);
    },
    onVisibleChange: function(func, context) {
        $(this).on('anol.layer.visible:change', {'context': context}, func);
    },
    offVisibleChange: function(func) {
        $(this).off('anol.layer.visible:change', func);
    },
    refresh: function() {
        if(this.olLayer instanceof ol.layer.Base && this.olLayer.getSource() instanceof ol.source.Source) {
            var source = this.olLayer.getSource();
            source.refresh();
        }
    },
    _createSourceOptions: function(srcOptions) {
        srcOptions = srcOptions || {};
        if(srcOptions.tilePixelRatio !== undefined) {
            srcOptions.tilePixelRatio = ol.has.DEVICE_PIXEL_RATIO > 1 ? srcOptions.tilePixelRatio : 1;
        }
        return srcOptions;
    }
};

;
/**
 * @ngdoc object
 * @name anol.layer.BaseWMS
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Image
 * @param {Object} options.olLayer.source Options for ol.source.ImageWMS
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
 anol.layer.BaseWMS = function(_options) {
    if(_options === false) {
        anol.layer.Layer.call(this, _options);
        return;
    }
    var defaults = {};
    var options = $.extend(true, {}, defaults, _options);

    anol.layer.Layer.call(this, options);
    this.wmsSourceLayers = anol.helper.stringSplit(this.olSourceOptions.params.LAYERS, ',');
    if(this.olLayerOptions.visible === false) {
        this.olSourceOptions.params.LAYERS = '';
    }
    this.visible = this.olLayerOptions.visible !== false;
};
anol.layer.BaseWMS.prototype = new anol.layer.Layer(false);
$.extend(anol.layer.BaseWMS.prototype, {
    CLASS_NAME: 'anol.layer.BaseWMS',
    OL_LAYER_CLASS: undefined,
    OL_SOURCE_CLASS: undefined,
    isCombinable: function(other) {
        var combinable = anol.layer.Layer.prototype.isCombinable.call(this, other);
        if(!combinable) {
            return false;
        }
        if(this.olSourceOptions.url !== other.olSourceOptions.url) {
            return false;
        }
        var thisParams = $.extend(true, {}, this.olSourceOptions.params);
        delete thisParams.LAYERS;
        var otherParams = $.extend(true, {}, other.olSourceOptions.params);
        delete otherParams.LAYERS;
        if(!angular.equals(thisParams, otherParams)) {
            return false;
        }
        return true;
    },
    getCombinedSource: function(other) {
        var olSource = this.olLayer.getSource();
        if(other.olLayerOptions.visible !== false) {
            var params = olSource.getParams();
            var layers = anol.helper.stringSplit(params.LAYERS, ',');
            layers = layers.concat(other.wmsSourceLayers);
            params.LAYERS = layers.join(',');
            olSource.updateParams(params);
        }
        var anolLayers = olSource.get('anolLayers');
        anolLayers.push(other);
        olSource.set('anolLayers', anolLayers);
        return olSource;
    },
    removeOlLayer: function() {
        if(this.combined) {
            var olSource = this.olLayer.getSource();
            var anolLayers = olSource.get('anolLayers');
            var idx = anolLayers.indexOf(this);
            if(idx > -1) {
                anolLayers.splice(idx, 1);
            }
            olSource.set('anolLayers', anolLayers);
        }
        anol.layer.Layer.prototype.removeOlLayer.call(this);
    },
    getVisible: function() {
        return this.visible;
    },
    setVisible: function(visible)  {
        if (visible == this.getVisible()) {
            return;
        }
        var insertLayerIdx = 0;
        var source = this.olLayer.getSource();
        var self = this;
        $.each(source.get('anolLayers'), function(idx, layer) {
            if(layer === self) {
                return false;
            }
            if(layer.getVisible()) {
                insertLayerIdx += layer.wmsSourceLayers.length;
            }
        });
        var params = source.getParams();
        var layers = anol.helper.stringSplit(params.LAYERS, ',');
        layers = layers.reverse();
        if(!visible) {
            layers = anol.helper.excludeList(layers, this.wmsSourceLayers);
        } else {
            layers = anol.helper.concat(layers, this.wmsSourceLayers, insertLayerIdx);
        }
        params.LAYERS = layers.reverse().join(',');
        source.updateParams(params);
        this.visible = visible;
        anol.layer.Layer.prototype.setVisible.call(this, layers.length > 0);
    },
    getLegendGraphicUrl: function() {
        var requestParams = {
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            SLD_VERSION: '1.1.0',
            REQUEST: 'GetLegendGraphic',
            FORMAT: 'image/png',
            LAYER: this.wmsSourceLayers.join(',')
        };
        if(this.legend.version !== undefined) {
            requestParams.VERSION = this.legend.version;
        }
        if(this.legend.sldVersion !== undefined) {
            requestParams.SLD_VERSION = this.legend.sldVersion;
        }
        if(this.legend.format !== undefined) {
            requestParams.FORMAT = this.legend.format;
        }

        var url = this.olLayer.getSource().getUrl();
        if(url.indexOf('?') === -1) {
            url += '?';
        } else if(url.lastIndexOf('&') !== url.length - 1) {
            url += '&';
        }

        return url + $.param(requestParams);
    },
    getFeatureInfoUrl: function(coordinate, resolution, projection, params) {
        var requestParams = $.extend(true,
            {},
            {
                QUERY_LAYERS: this.wmsSourceLayers.join(','),
                LAYERS: this.wmsSourceLayers.join(',')
            },
            params
        );

        return this.olLayer.getSource().getGetFeatureInfoUrl(
            coordinate, resolution, projection, requestParams
        );
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.Feature
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Vector
 * @param {Object} options.olLayer.source Options for ol.source.Vector
 * @param {Object|Boolean} options.cluster options for clustering. When true, defaults will be used
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
 anol.layer.Feature = function(_options) {
    if(_options === false) {
        anol.layer.Layer.call(this, _options);
        return;
    }
    var self = this;
    var defaults = {};
    var options = $.extend({}, defaults, _options );

    this.style = options.style;
    this.minResolution = (options.style || {}).minResolution;
    this.maxResolution = (options.style || {}).maxResolution;
    this.hasPropertyLabel = (options.style || {}).propertyLabel !== undefined;

    this.externalGraphicPrefix = options.externalGraphicPrefix;
    this.hasPropertyLabel = false;

    this.loaded = true;
    this.saveable = options.saveable || false;
    this.editable = options.editable || false;

    this.clusterOptions = options.cluster || false;

    if(this.clusterOptions !== false) {
        this.clusterOptions = this._prepareClusterStyles(this.clusterOptions);
    }

    this.unclusteredSource = undefined;
    this.selectClusterControl = undefined;

    anol.layer.Layer.call(this, options);
    this.isVector = true;
};
anol.layer.Feature.prototype = new anol.layer.Layer(false);
$.extend(anol.layer.Feature.prototype, {
    CLASS_NAME: 'anol.layer.Feature',
    OL_LAYER_CLASS: ol.layer.Vector,
    OL_SOURCE_CLASS: ol.source.Vector,
    DEFAULT_FONT_FACE: 'Helvetica',
    DEFAULT_FONT_SIZE: '10px',
    DEFAULT_FONT_WEIGHT: 'normal',
    // this is the default ol style. we need to define it because
    // createStyle function have to return a valid style even if
    // clusterStyle in clusterOptions is undefined
    DEFAULT_CLUSTERED_STYLE: new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.4)'
            }),
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 1.25
            }),
            radius: 5
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.4)'
        }),
        stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1.25
        })
    }),
    DEFAULT_UNCLUSTERED_STYLE: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
                color: "rgba(0,255,255,1)",
                width: 1
            }),
            fill: new ol.style.Fill({
                color: "rgba(0,255,255,0.3)"
            })
        }),
        stroke: new ol.style.Stroke({
            color: "rgba(0,255,255,1)",
            width: 1
        }),
        fill: new ol.style.Fill({
            color: "rgba(0,255,255,0.3)"
        })
    }),
    DEFAULT_SELECT_CLUSTER_STYLE: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
                color: "rgba(255,255,0,1)",
                width: 1
            }),
            fill: new ol.style.Fill({
                color: "rgba(255,255,0,0.3)"
            })
        }),
        stroke: new ol.style.Stroke({
            color: "rgba(255,255,0,1)",
            width: 1
        }),
        fill: new ol.style.Fill({
            color: "rgba(255,255,0,0.3)"
        })
    }),
    setOlLayer: function(olLayer) {
        var self = this;
        anol.layer.Layer.prototype.setOlLayer.call(this, olLayer);

        // if a style function is in layer config we don't create a style function here
        if(!angular.isFunction(self.olLayerOptions.style)) {
            var defaultStyle = olLayer.getStyle();

            if(angular.isFunction(defaultStyle)) {
                defaultStyle = defaultStyle()[0];
            }

            if(this.style !== undefined) {
                var createImageStyleFunction = this.style.externalGraphic !== undefined ? this.createIconStyle : this.createCircleStyle;

                this.defaultStyle = new ol.style.Style({
                    image: createImageStyleFunction.call(this, this.style, defaultStyle.getImage()),
                    fill: this.createFillStyle(this.style, defaultStyle.getFill()),
                    stroke: this.createStrokeStyle(this.style, defaultStyle.getStroke()),
                    text: this.createTextStyle(this.style, defaultStyle.getText())
                });
            } else {
                this.defaultStyle = defaultStyle;
            }
            olLayer.setStyle(function(feature, resolution) {
                var style = self.createStyle(feature, resolution);
                if(angular.isArray(style)) {
                    return style;
                }
                return [style];
            });
        }

        if(this.isClustered()) {
            this.unclusteredSource.set('anolLayers', this.olLayer.getSource().get('anolLayers'));
        }
    },
    removeOlLayer: function() {
        if(this.isClustered()) {
            var unclusteredAnolLayers = this.unclusteredSource.get('anolLayers');
            var unclusteredIdx = unclusteredAnolLayers.indexOf(this);
            if(unclusteredIdx > -1) {
                unclusteredAnolLayers.splice(unclusteredIdx, 1);
                this.unclusteredSource.set('anolLayers', unclusteredAnolLayers);
            }
            var anolLayers = this.olLayer.getSource().get('anolLayers');
            var idx = anolLayers.indexOf(this);
            if(idx > -1) {
                anolLayers.splice(idx, 1);
                this.olLayer.getSource().set('anolLayers', anolLayers);
            }
            this.olSource.clear(true);
        }
        anol.layer.Layer.prototype.removeOlLayer.call(this);
    },
    isCombinable: function() {
        return false;
    },
    extent: function() {
        var extent = this.olLayer.getSource().getExtent();
        if(ol.extent.isEmpty(extent)) {
            return false;
        }
        return extent;
    },
    clear: function() {
        this.olLayer.getSource().clear();
    },
    addFeature: function(feature) {
        this.olLayer.getSource().addFeature(feature);
    },
    addFeatures: function(features) {
        this.olLayer.getSource().addFeatures(features);
    },
    getFeatures: function() {
        return this.olLayer.getSource().getFeatures();
    },
    createStyle: function(feature, resolution) {
        if(this.clusterOptions !== false && feature !== undefined) {
            // when clustering, a features have a features array containing features clustered into this feature
            // so when feature don't have features or only one we draw in normal layer style instead of cluster
            // style
            var clusteredFeatures = feature.get('features');
            if(angular.isDefined(clusteredFeatures)) {
                return this.createClusterStyle(feature);
            }
        }
        var defaultStyle = angular.isFunction(this.defaultStyle) ?
            this.defaultStyle(feature, resolution)[0] : this.defaultStyle;
        if(feature === undefined) {
            return defaultStyle;
        }
        var geometryType = feature.getGeometry().getType();
        var featureStyle = feature.get('style') || {};
        if(
            angular.equals(featureStyle, {}) &&
            !this.hasPropertyLabel &&
            this.minResolution === undefined &&
            this.maxResolution === undefined
        ) {
            return defaultStyle;
        }

        var minResolution = featureStyle.minResolution || this.minResolution;
        if(angular.isString(minResolution)) {
            minResolution = parseFloat(minResolution);
        }
        var maxResolution = featureStyle.maxResolution || this.maxResolution;
        if(angular.isString(maxResolution)) {
            maxResolution = parseFloat((maxResolution));
        }
        if(
            (angular.isDefined(minResolution) && minResolution > resolution) ||
            (angular.isDefined(maxResolution) && maxResolution < resolution)
        ) {
            return new ol.style.Style();
        }

        var styleOptions = {};
        if(geometryType === 'Point') {
            styleOptions.image = this.createImageStyle(featureStyle, defaultStyle.getImage());
        } else {
            // line features ignores fill style
            styleOptions.fill = this.createFillStyle(featureStyle, defaultStyle.getFill());
            styleOptions.stroke = this.createStrokeStyle(featureStyle, defaultStyle.getStroke());
        }
        styleOptions.text = this.createTextStyle(featureStyle, defaultStyle.getText(), feature);
        return new ol.style.Style(styleOptions);
    },
    createClusterStyle: function(features) {
        return this.DEFAULT_CLUSTERED_STYLE;
    },
    createImageStyle: function(style, defaultImageStyle) {
        var radius = style.radius;
        var externalGraphic = style.externalGraphic;

        var isCircle = radius !== undefined;
        var isIcon = externalGraphic !== undefined;
        var isDefaultCircle = defaultImageStyle instanceof ol.style.Circle;
        var isDefaultIcon = defaultImageStyle instanceof ol.style.Icon;

        if (isIcon || (!isCircle && isDefaultIcon)) {
            return this.createIconStyle(style, defaultImageStyle);
        } else if(isCircle || (!isIcon && isDefaultCircle)) {
            return this.createCircleStyle(style, defaultImageStyle);
        }
        return defaultImageStyle;
    },
    createCircleStyle: function(style, defaultCircleStyle) {
        var defaultStrokeStyle = new ol.style.Stroke();
        var defaultFillStyle = new ol.style.Fill();
        var radius;
        if(defaultCircleStyle instanceof ol.style.Circle) {
            defaultStrokeStyle = defaultCircleStyle.getStroke();
            defaultFillStyle = defaultCircleStyle.getFill();
            radius = defaultCircleStyle.getRadius();
        }

        var _radius = style.radius;
        if(_radius !== undefined) {
            radius = parseFloat(_radius);
        }
        return new ol.style.Circle({
            radius: radius,
            stroke: this.createStrokeStyle(style, defaultStrokeStyle),
            fill: this.createFillStyle(style, defaultFillStyle)
        });
    },
    createIconStyle: function(style, defaultIconStyle) {
        var styleOptions = {};

        if(defaultIconStyle instanceof ol.style.Icon) {
            styleOptions.src = defaultIconStyle.getSrc();
            styleOptions.rotation = defaultIconStyle.getRotation();
            styleOptions.scale = defaultIconStyle.getScale();
            styleOptions.size = defaultIconStyle.getSize();
            styleOptions.imgSize = defaultIconStyle.getSize();
        }

        if(style.externalGraphic !== undefined) {
            if(this.externalGraphicPrefix !== undefined) {
                styleOptions.src = this.externalGraphicPrefix + style.externalGraphic;
            } else {
                styleOptions.src = style.externalGraphic;
            }
        }

        if(style.graphicRotation !== undefined) {
            styleOptions.rotation = this._degreeToRad(parseFloat(style.graphicRotation));
        } else if (this.style !== undefined && this.style.graphicRotation !== undefined) {
            styleOptions.rotation = this._degreeToRad(parseFloat(this.style.graphicRotation));
        }

        if(style.graphicWidth !== undefined && style.graphicHeight !== undefined) {
            styleOptions.size = [
                parseInt(style.graphicWidth),
                parseInt(style.graphicHeight)
            ];
            styleOptions.imgSize = [
                parseInt(style.graphicWidth),
                parseInt(style.graphicHeight)
            ];
        }

        if(style.graphicColor !== undefined) {
            styleOptions.color = style.graphicColor;
        }

        if(style.anchorOrigin !== undefined) {
            styleOptions.anchorOrigin = style.anchorOrigin;
        }

        var anchor = [0.5, 0.5];
        if(style.graphicXAnchor !== undefined) {
            anchor[0] = parseFloat(style.graphicXAnchor);
            styleOptions.anchorXUnits = 'pixel';
        }
        if(style.anchorXUnits !== undefined) {
            styleOptions.anchorXUnits = style.anchorXUnits;
        }
        if(style.graphicYAnchor !== undefined) {
            anchor[1] = parseFloat(style.graphicYAnchor);
            styleOptions.anchorYUnits = 'pixel';
        }
        if(style.anchorYUnits !== undefined) {
            styleOptions.anchorYUnits = style.anchorYUnits;
        }
        styleOptions.anchor = anchor;

        if(style.graphicScale !== undefined) {
            styleOptions.scale = parseFloat(style.graphicScale);
        }
        return new ol.style.Icon(styleOptions);
    },
    createFillStyle: function(style, defaultFillStyle) {
        var color = ol.color.asArray(defaultFillStyle.getColor()).slice();
        var fillColor = style.fillColor;
        if (fillColor !== undefined) {
            fillColor = ol.color.asArray(fillColor);
            color[0] = fillColor[0];
            color[1] = fillColor[1];
            color[2] = fillColor[2];
        }
        var fillOpacity = style.fillOpacity;
        if(fillOpacity !== undefined) {
            color[3] = parseFloat(fillOpacity);
        }
        return new ol.style.Fill({
            color: color
        });
    },
    createStrokeStyle: function(style, defaultStrokeStyle) {
        var color = ol.color.asArray(defaultStrokeStyle.getColor()).slice();
        var strokeWidth = defaultStrokeStyle.getWidth();
        var strokeDashstyle = defaultStrokeStyle.getLineDash();

        var strokeColor = style.strokeColor;
        if(strokeColor !== undefined) {
            strokeColor = ol.color.asArray(strokeColor);
            color[0] = strokeColor[0];
            color[1] = strokeColor[1];
            color[2] = strokeColor[2];
        }
        var strokeOpacity = style.strokeOpacity;
        if(strokeOpacity !== undefined) {
            color[3] = parseFloat(strokeOpacity);
        }
        var _strokeWidth = style.strokeWidth;
        if(_strokeWidth !== undefined) {
            strokeWidth = parseFloat(_strokeWidth);
        }
        var _strokeDashstyle = style.strokeDashstyle;
        if(_strokeDashstyle !== undefined) {
            strokeDashstyle = this.createDashStyle(strokeWidth, _strokeDashstyle);
        }

        return new ol.style.Stroke({
            color: color,
            width: strokeWidth,
            lineDash: strokeDashstyle,
            lineJoin: 'round'
        });
    },
    // Taken from OpenLayers 2.13.1
    // see https://github.com/openlayers/openlayers/blob/release-2.13.1/lib/OpenLayers/Renderer/SVG.js#L391
    createDashStyle: function(strokeWidth, strokeDashstyle) {
        var w = strokeWidth;
        var str = strokeDashstyle;
        switch (str) {
            case 'dot':
                return [1, 4 * w];
            case 'dash':
                return [4 * w, 4 * w];
            case 'dashdot':
                return [4 * w, 4 * w, 1, 4 * w];
            case 'longdash':
                return [8 * w, 4 * w];
            case 'longdashdot':
                return [8 * w, 4 * w, 1, 4 * w];
            // also matches 'solid'
            default:
                return undefined;
          }
    },
    // return function for labelKey from feature if feature is undefined
    // used for default layer style
    getLabel: function(feature, labelKey) {
        if(feature === undefined) {
            return function(_feature) {
                if(_feature === undefined) {
                    return '';
                }
                return _feature.get(labelKey);
            };
        }
        return feature.get(labelKey);
    },
    createTextStyle: function(style, defaultTextStyle, feature) {
        var fontWeight = this.DEFAULT_FONT_WEIGHT;
        var fontFace = this.DEFAULT_FONT_FACE;
        var fontSize = this.DEFAULT_FONT_SIZE;
        var defaultText;
        var defaultTextFillStyle;
        var defaultTextRotation;
        // atm defaultTextStyle is null
        if(defaultTextStyle !== null) {
            var splittedFont = defaultTextStyle.getFont().split(' ');
            fontWeight = splittedFont[0];
            fontSize = splittedFont[1];
            fontFace = splittedFont[2];
            defaultTextFillStyle = defaultTextStyle.getFill();
            defaultText = defaultTextStyle.getText();
            defaultTextRotation = defaultTextStyle.getRotation();
            if(angular.isFunction(defaultText) && feature !== undefined) {
                defaultText = defaultText.call(this, feature);
            }
        }
        var styleOptions = {};
        if(style.text !== undefined) {
            styleOptions.text = style.text;
        } else if(style.propertyLabel !== undefined) {
            styleOptions.text = this.getLabel(feature, style.propertyLabel);
        } else if(defaultText !== undefined) {
            styleOptions.text = defaultText;
        }
        if(styleOptions.text === undefined && feature !== undefined) {
            return;
        }
        if(style.fontWeight !== undefined) {
            fontWeight = style.fontWeight;
        }
        if(style.fontSize !== undefined) {
            fontSize = style.fontSize;
        }
        if(style.fontFace !== undefined) {
            fontFace = style.fontFace;
        }
        styleOptions.font = [fontWeight, fontSize, fontFace].join(' ');

        if(style.fontOffsetX !== undefined) {
            styleOptions.offsetX = style.fontOffsetX;
        }
        if(style.fontOffsetY !== undefined) {
            styleOptions.offsetY = style.fontOffsetY;
        }
        if(style.fontRotation !== undefined) {
            styleOptions.rotation = this._degreeToRad(parseFloat(style.fontRotation));
        } else if(defaultTextRotation !== undefined) {
            styleOptions.rotation = defaultTextRotation;
        }

        var fontColor = [];
        if(defaultTextFillStyle !== undefined && defaultTextFillStyle !== null) {
            var defaultFontColor = defaultTextFillStyle.getColor();
            if(defaultFontColor !== undefined) {
                fontColor = ol.color.asArray(defaultFontColor).slice();
            }
        }
        if(style.fontColor !== undefined) {
            var _fontColor = ol.color.asArray(style.fontColor).slice();
            if(_fontColor !== undefined) {
                fontColor[0] = _fontColor[0];
                fontColor[1] = _fontColor[1];
                fontColor[2] = _fontColor[2];
                fontColor[3] = _fontColor[3] || fontColor[3] || 1;
            }
        }
        if(fontColor !== undefined && fontColor.length === 4) {
            styleOptions.fill = new ol.style.Fill({
                color: fontColor
            });
        }
        if(Object.keys(styleOptions).length > 0) {
            return new ol.style.Text(styleOptions);
        }
        return undefined;
    },
    createClusterStyleFromDefinition: function(styleDefinition, defaultStyle) {
        var style = new ol.style.Style({
            image: this.createImageStyle(styleDefinition, defaultStyle.getImage()),
            fill: this.createFillStyle(styleDefinition, defaultStyle.getFill()),
            stroke: this.createStrokeStyle(styleDefinition, defaultStyle.getStroke()),
            text: this.createTextStyle(styleDefinition, defaultStyle.getText())
        });
        if(styleDefinition.text === '__num_features__') {
            return function(feature, resolution) {
                style.getText().setText(feature.get('features').length.toString());
                return [style];
            };
        }
        return style;
    },
    isClustered: function() {
        return this.clusterOptions !== false;
    },
    _degreeToRad: function(degree) {
        if(degree === 0) {
            return 0;
        }
        return Math.PI * (degree / 180);
    },
    _createSourceOptions: function(srcOptions) {
        if(this.clusterOptions === false) {
            return srcOptions;
        }
        srcOptions = anol.layer.Layer.prototype._createSourceOptions.call(this, srcOptions);

        this.unclusteredSource = new this.OL_SOURCE_CLASS(srcOptions);

        this.OL_SOURCE_CLASS = ol.source.Cluster;

        return {
            source: this.unclusteredSource,
            distance: 50
        };
    },
    _prepareClusterStyles: function(clusterOptions) {
        if(clusterOptions.clusterStyle !== undefined && !(clusterOptions.clusterStyle instanceof ol.style.Style)) {
            clusterOptions.clusterStyle = this.createClusterStyleFromDefinition(clusterOptions.clusterStyle, this.DEFAULT_UNCLUSTERED_STYLE);
        }
        if(clusterOptions.selectClusterStyle !== undefined && !(clusterOptions.selectClusterStyle instanceof ol.style.Style)) {
            clusterOptions.selectClusterStyle = this.createClusterStyleFromDefinition(clusterOptions.selectClusterStyle, this.DEFAULT_SELECT_CLUSTER_STYLE);
        }
        return clusterOptions;
    }
    // TODO add getProperties method including handling of hidden properties like style
    // TODO add hasProperty method
});
;
/**
 * @ngdoc object
 * @name anol.layer.StaticGeoJSON
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Vector
 * @param {Object} options.olLayer.source Options for ol.source.Vector
 * @param {Object} options.olLayer.source.url Url to GeoJSON
 * @param {String} options.olLayer.source.dataProjection Projection if GeoJSON
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
anol.layer.StaticGeoJSON = function(_options) {
    if(_options === false) {
        anol.layer.Feature.call(this, _options);
        return;
    }
    var defaults = {};
    var options = $.extend({}, defaults, _options);

    this.loaded = false;

    anol.layer.Feature.call(this, options);
};
anol.layer.StaticGeoJSON.prototype = new anol.layer.Feature(false);
$.extend(anol.layer.StaticGeoJSON.prototype, {
    CLASS_NAME: 'anol.layer.StaticGeoJSON',
    setOlLayer: function(olLayer) {
        var self = this;
        anol.layer.Feature.prototype.setOlLayer.call(this, olLayer);
        olLayer.getSource().once('change', function() {
            self.loaded = true;
        });
    },
    /**
     * Additional source options
     * - url
     * - dataProjection
     */
    _createSourceOptions: function(srcOptions) {
        // TODO load dataProjection from received GeoJSON
        srcOptions.format = new ol.format.GeoJSON({
            defaultDataProjection: srcOptions.dataProjection
        });
        return anol.layer.Feature.prototype._createSourceOptions.call(this,
            srcOptions
        );
    },
    /**
     * Replaces source by new one with given url
     * - url
     */
    changeUrl: function(url) {
        this.loaded = false;
        this.olSourceOptions.url = url;
        var newSource = new ol.source.Vector(this.olSourceOptions);
        newSource.once('change', function() {
            self.loaded = true;
        });
        this.olLayer.setSource(newSource);
    }
});
;
/**
 * @ngdoc object
 * @name anol.Control.Control
 *
 * @param {Object} options AnOl Control options
 * @param {boolean} options.active Controls initial active state. Default false
 * @param {boolean} options.exclusive Flag control as exclusive. Only one exclusive control can be active at one time
 * @param {boolean} options.subordinate Flag control as subordinate. Subordinate controls are permanently active as long as no exclusive control is active.
 * @param {Object} options.element DOM-Element control belongs to
 * @param {Object} options.target DOM-Element control should be placed in
 * @param {ol.interaction.Interaction} options.interaction Openlayers interaction used by control
 * @param {ol.control.Control} options.olControl OpenLayers control if this control.
 * - If olControl is undefined, a new ol.control.Control with given options.element and options.target is created
 * - If olControl is null, anol.control.Control don't have an ol.control.Control
 *
 * @description
 * anol.control.Control is designed to work with anol.map.ControlsService.
 */
anol.control.Control = function(options) {
    if(options === undefined) {
        return;
    }

    this.active = options.active || false;
    this.disabled = options.disabled || false;
    this.exclusive = options.exclusive || false;
    this.subordinate = options.subordinate || false;
    this.element = options.element;
    this.interactions = options.interactions || [];

    if(options.olControl === undefined) {
        var controlElement;
        if(this.element !== undefined) {
            controlElement = this.element[0];
        }
        var target;
        if(options.target !== undefined) {
            target = options.target[0];
        }

        this.olControl = new ol.control.Control({
            element: controlElement,
            target: target
        });
    } else {
        this.olControl = options.olControl;
    }

    if(this.disabled) {
        this.addClass('disabled');
    }
};

anol.control.Control.prototype = {
    CLASS_NAME: 'anol.control.Control',
    DEFAULT_OPTIONS: {},
    activate: function() {
        if(this.active === true) {
            return;
        }
        this.active = true;
        this.addClass('active');
        $(this).triggerHandler('anol.control.activate');
    },
    onActivate: function(func, context) {
        var targetControl = this;
        var handler = function() {
            func(targetControl, context);
        };
        $(this).on('anol.control.activate', handler);
        return handler;
    },
    oneActivate: function(func, context) {
        var targetControl = this;
        var handler = function() {
            func(targetControl, context);
        };
        $(this).one('anol.control.activate', handler);
        return handler;
    },
    unActivate: function(handler) {
        $(this).off('anol.control.activate', handler);
    },
    deactivate: function() {
        if(this.active === false) {
            return;
        }
        this.active = false;
        this.removeClass('active');
        $(this).triggerHandler('anol.control.deactivate');
    },
    onDeactivate: function(func, context) {
        var targetControl = this;
        var handler = function() {
            func(targetControl, context);
        };
        $(this).on('anol.control.deactivate', handler);
        return handler;
    },
    oneDeactivate: function(func, context) {
        var targetControl = this;
        var handler = function() {
            func(targetControl, context);
        };
        $(this).one('anol.control.deactivate', handler);
        return handler;
    },
    unDeactivate: function(handler) {
        $(this).off('anol.control.deactivate', handler);
    },
    disable: function() {
        this.deactivate();
        this.disabled = true;
        this.addClass('disabled');
    },
    enable: function() {
        this.disabled = false;
        this.removeClass('disabled');
    },
    addClass: function(className) {
        if(this.element !== undefined) {
            this.element.addClass(className);
        }
    },
    removeClass: function(className) {
        if(this.element !== undefined) {
            this.element.removeClass(className);
        }
    }
};
;
anol.geocoder.Base = function(_options) {
    if(_options === undefined) {
        return;
    }
    this.url = _options.url;
    this.options = _options;
};

anol.geocoder.Base.prototype = {
    CLASS_NAME: 'anol.geocoder.Base',
    handleResponse: function(response) {
        var self = this;
        var results = [];
        $.each(response, function(idx, result) {
            results.push({
                displayText: self.extractDisplayText(result),
                coordinate: self.extractCoordinate(result),
                projectionCode: self.RESULT_PROJECTION
            });
        });
        return results;
    },
    request: function(searchString) {
        var self = this;
        var deferred = $.Deferred();
        $.ajax({
            url: self.url,
            data: self.getData(searchString),
            method: self.options.method
        })
        .done(function(response) {
                    var results = self.handleResponse(response);
                    deferred.resolve(results);
                })
        .fail(function() {
            deferred.resolve([]);
        });
        return deferred.promise();
    },
    extractDisplayText: function() {
        throw 'Not implemented';
    },
    extractCoordinate: function() {
        throw 'Not implemented';
    },
    getData: function() {
        throw 'Not implemented';
    }
};
;
/**
 * @ngdoc object
 * @name anol.geocoder.Nominatim
 *
 * @param {Object} options Options
 * @param {string} options.url Url of nominatim geocoder. Default 'http://nominatim.openstreetmap.org/search?'
 * @param {Array} options.viewbox Box to restrict search to
 *
 * @description
 * Nominatim geocoder. See http://wiki.openstreetmap.org/wiki/Nominatim
 */
anol.geocoder.Nominatim = function(_options) {
    var defaults = {
        url: 'http://nominatim.openstreetmap.org/search?'
    };
    var options = $.extend({},
        defaults,
        _options
    );
    anol.geocoder.Base.call(this, options);
};
anol.geocoder.Nominatim.prototype = new anol.geocoder.Base();
$.extend(anol.geocoder.Nominatim.prototype, {
    CLASS_NAME: 'anol.geocoder.Nominatim',
    RESULT_PROJECTION: 'EPSG:4326',
    extractDisplayText: function(result) {
        return result.display_name;
    },
    extractCoordinate: function(result) {
        return [
            parseFloat(result.lon),
            parseFloat(result.lat)
        ];
    },
    getData: function(searchString) {
        var data = {
            q: searchString,
            format: 'json',
            limit: this.options.limit !== undefined ? this.options.limit : 10
        };
        if(this.options.key !== undefined) {
            data.key = this.options.key;
        }
        if(this.options.viewbox !== undefined) {
            data.bounded = 1;
            data.viewbox = this.options.viewbox.join(',');
        }
        return data;
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.BBOXGeoJSON
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Vector
 * @param {Object} options.olLayer.source Options for ol.source.Vector
 * @param {string} options.olLayer.source.url Url for requesting a GeoJSON
 * @param {string} options.olLayer.source.featureProjection Projection of received GeoJSON
 * @param {Object} options.olLayer.source.additionalParameters Additional parameters added to request
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.StaticGeoJSON}.
 *
 * @notice
 * Every feature in response must have a '__layer__' property containing the layername given to this layer.
 * Otherwise features will not be styled.
 *
 * Ask *url* with current projection and bbox.
 */
anol.layer.BBOXGeoJSON = function(_options) {
    if(
        angular.isObject(_options) &&
        angular.isObject(_options.olLayer) &&
        angular.isObject(_options.olLayer.source)
    ) {
        this.additionalRequestParameters = _options.olLayer.source.additionalParameters;
    }
    anol.layer.StaticGeoJSON.call(this, _options);
};
anol.layer.BBOXGeoJSON.prototype = new anol.layer.StaticGeoJSON(false);
$.extend(anol.layer.BBOXGeoJSON.prototype, {
    CLASS_NAME: 'anol.layer.BBOXGeoJSON',
    setOlLayer: function(olLayer) {
        anol.layer.StaticGeoJSON.prototype.setOlLayer.call(this, olLayer);
        this.olSource = this.olLayer.getSource();
    },
    /**
     * Additional source options
     * - url
     * - featureProjection
     * - additionalParameters
     */
    _createSourceOptions: function(srcOptions) {
        var self = this;
        srcOptions.format = new ol.format.GeoJSON();
        srcOptions.strategy = ol.loadingstrategy.bbox;
        srcOptions.loader = function(extent, resolution, projection) {
            var additionalParameters = {};
            angular.forEach(self.olSource.get('anolLayers'), function(layer) {
                if(layer.getVisible()) {
                    additionalParameters = anol.helper.mergeObjects(additionalParameters, layer.additionalRequestParameters);
                }
            });
            self.loader(
                srcOptions.url,
                extent,
                resolution,
                projection,
                srcOptions.featureProjection,
                srcOptions.extentProjection,
                srcOptions.dataProjection,
                additionalParameters
            );
        };

        return anol.layer.StaticGeoJSON.prototype._createSourceOptions.call(this,
            srcOptions
        );
    },
    loader: function(url, extent, resolution, projection, featureProjection, extentProjection, dataProjection, additionalParameters) {
        var self = this;
        if (extentProjection !== undefined) {
            extent = ol.proj.transformExtent(extent, projection, extentProjection);
        } 
        var params = [
            'srs=' + extentProjection.getCode(),
            'bbox=' + extent.join(','),
            'resolution=' + resolution,
            'zoom=' + self.map.getView().getZoom()
        ];
        if($.isFunction(additionalParameters)) {
            params.push(additionalParameters());
        } else if(angular.isObject(additionalParameters)) {
            angular.forEach(additionalParameters, function(value, key) {
                params.push(key + '=' + value);
            });
        }

        $.ajax({
            url: url + params.join('&'),
            dataType: 'json'
        })
        .done(function(response) {
            self.responseHandler(response, featureProjection, dataProjection);
        });
    },
    responseHandler: function(response, featureProjection, dataProjection) {
        var self = this;
        // TODO find a better solution
        // remove all features from source.
        // otherwise features in source might be duplicated
        // cause source.readFeatures don't look in source for
        // existing received features.
        // we can't use source.clear() at this place, cause
        // source.clear() will trigger to reload features from server
        // and this leads to an infinite loop
        // even with opt_fast=true
        var sourceFeatures = self.olLayer.getSource().getFeatures();
        for(var i = 0; i < sourceFeatures.length; i++) {
            self.olLayer.getSource().removeFeature(sourceFeatures[i]);
        }

        var format = new ol.format.GeoJSON({
            defaultDataProjection: dataProjection,
        });
        var features = format.readFeatures(
          response, {
            defaultDataProjection: dataProjection,
            featureProjection: featureProjection
          }
        );
        self.olLayer.getSource().addFeatures(features);
    },
    refresh: function() {
        this.olLayer.getSource().clear();
        this.olLayer.getSource().refresh();
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.DynamicGeoJSON
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Vector
 * @param {Object} options.olLayer.source Options for ol.source.Vector
 * @param {string} options.olLayer.source.url Url for requesting a GeoJSON
 * @param {string} options.olLayer.source.featureProjection Projection of received GeoJSON
 * @param {Object} options.olLayer.source.additionalParameters Additional parameters added to request
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.StaticGeoJSON}.
 *
 * @notice
 * Every feature in response must have a '__layer__' property containing the layername given to this layer.
 * Otherwise features will not be styled.
 *
 * Ask *url* with current projection and bbox.
 */
anol.layer.DynamicGeoJSON = function(_options) {
    if(
        angular.isObject(_options) &&
        angular.isObject(_options.olLayer) &&
        angular.isObject(_options.olLayer.source)
    ) {
        this.additionalRequestParameters = _options.olLayer.source.additionalParameters;
    }
    anol.layer.StaticGeoJSON.call(this, _options);
};
anol.layer.DynamicGeoJSON.prototype = new anol.layer.StaticGeoJSON(false);
$.extend(anol.layer.DynamicGeoJSON.prototype, {
    CLASS_NAME: 'anol.layer.DynamicGeoJSON',
    setOlLayer: function(olLayer) {
        anol.layer.StaticGeoJSON.prototype.setOlLayer.call(this, olLayer);
        this.olSource = this.isClustered() ? this.unclusteredSource : olLayer.getSource();
    },
    isCombinable: function(other) {
        if(other.CLASS_NAME !== this.CLASS_NAME) {
            return false;
        }
        if(this.olSourceOptions.url !== other.olSourceOptions.url) {
            return false;
        }
        if(this.olSourceOptions.featureProjection !== other.olSourceOptions.featureProjection) {
            return false;
        }
        if(this.clusterOptions !== false && this.anolGroup !== other.anolGroup) {
            return false;
        }
        return true;
    },
    getCombinedSource: function(other) {
        var anolLayers = this.olSource.get('anolLayers');
        anolLayers.push(other);
        this.olSource.set('anolLayers', anolLayers);

        if(this.isClustered) {
            return this.olLayer.getSource();
        }
        return this.olSource;
    },
    setVisible: function(visible) {
        anol.layer.StaticGeoJSON.prototype.setVisible.call(this, visible);
        // find better solution than clear, cause it's remove all features from the source, not only
        // features related to current layer. But we need to call clear, otherwise source extent is not
        // resetted and it will not be reloaded with updated url params
        this.olSource.clear(true);
    },
    /**
     * Additional source options
     * - url
     * - featureProjection
     * - additionalParameters
     */
    _createSourceOptions: function(srcOptions) {
        var self = this;
        srcOptions.format = new ol.format.GeoJSON();
        srcOptions.strategy = ol.loadingstrategy.bbox;

        srcOptions.loader = function(extent, resolution, projection) {
            var additionalParameters = {};
            angular.forEach(self.olSource.get('anolLayers'), function(layer) {
                if(layer.getVisible()) {
                    additionalParameters = anol.helper.mergeObjects(additionalParameters, layer.additionalRequestParameters);
                }
            });
            self.loader(
                srcOptions.url,
                extent,
                resolution,
                projection,
                srcOptions.featureProjection,
                additionalParameters
            );
        };

        return anol.layer.StaticGeoJSON.prototype._createSourceOptions.call(this,
            srcOptions
        );
    },
    loader: function(url, extent, resolution, projection, featureProjection, additionalParameters) {
        var self = this;
        var params = [
            'srs=' + projection.getCode(),
            'bbox=' + extent.join(','),
            'resolution=' + resolution,
            'zoom='+self.map.getView().getZoom()
        ];
        if($.isFunction(additionalParameters)) {
            params.push(additionalParameters());
        } else if(angular.isObject(additionalParameters)) {
            angular.forEach(additionalParameters, function(value, key) {
                params.push(key + '=' + value);
            });
        }

        $.ajax({
            url: url + params.join('&'),
            dataType: 'json'
        })
        .done(function(response) {
            self.responseHandler(response, featureProjection);
        });
    },
    responseHandler: function(response, featureProjection) {
        var self = this;
        // TODO find a better solution
        // remove all features from source.
        // otherwise features in source might be duplicated
        // cause source.readFeatures don't look in source for
        // existing received features.
        // we can't use source.clear() at this place, cause
        // source.clear() will trigger to reload features from server
        // and this leads to an infinite loop
        // even with opt_fast=true
        var sourceFeatures = self.olSource.getFeatures();
        for(var i = 0; i < sourceFeatures.length; i++) {
            self.olSource.removeFeature(sourceFeatures[i]);
        }
        var format = new ol.format.GeoJSON();
        var features = format.readFeatures(response, {
            featureProjection: featureProjection
        });
        self.olSource.addFeatures(features);
    },
    createStyle: function(feature, resolution) {
        var parentFunc = anol.layer.StaticGeoJSON.prototype.createStyle;

        // call parent func when feature is undefined
        if(feature === undefined) {
            return parentFunc.call(this, feature, resolution);
        }

        var features = feature.get('features');

        // normal feature
        if(features === undefined) {
            // return empty style if feature not belongs to this layer
            if(feature.get('__layer__') !== this.name) {
                return new ol.style.Style();
            } else {
                return parentFunc.call(this, feature, resolution);
            }
        }

        // only for cluster features

        // cluster with one feature
        if(features.length === 1) {
            if(features[0].get('__layer__') === this.name) {
                return parentFunc.call(this, features[0], resolution);
            } else {
                return new ol.style.Style();
            }
        }

        var sourceLayers = this.olSource.get('anolLayers');
        var styleLayer;
        for(var i = 0; i < sourceLayers.length; i++) {
            if(sourceLayers[i].getVisible()) {
                styleLayer = sourceLayers[i];
                break;
            }
        }

        if(styleLayer !== undefined && styleLayer !== this) {
            return new ol.style.Style();
        }

        // cluster with more than one feature
        return parentFunc.call(this, feature, resolution);
    },
    createClusterStyle: function(clusterFeature) {
        var visible = ol.extent.containsCoordinate(
            this.map.getView().calculateExtent(this.map.getSize()),
            clusterFeature.getGeometry().getCoordinates()
        );
        if(!visible) {
            return new ol.style.Style();
        }
        var cachedStyle = clusterFeature.get('cachedStyle');
        if(cachedStyle !== null && cachedStyle !== undefined) {
            return cachedStyle;
        }
        var self = this;
        var legendItems = {};
        var objCount = 0;
        var layers = this.olLayer.getSource().get('anolLayers');
        // iterate over revealed features and sort/count by layer
        clusterFeature.get('features').forEach(function(feature) {
            layers.forEach(function(layer) {
                if(layer.unclusteredSource.getFeatures().indexOf(feature) > -1) {
                    if(layer.name === feature.get('__layer__')) {
                        if(legendItems[layer.name] === undefined) {
                            legendItems[layer.name] = {
                                layer: layer,
                                count: 0
                            };
                            objCount ++;
                        }
                        legendItems[layer.name].count ++;
                    }
                }

            });
        });

        var styles = [];

        var even = objCount % 2 === 0;
        var i = 0;
        var lastXAnchor = 0;
        angular.forEach(legendItems, function(value) {
            var defaultStyle = value.layer.olLayer.getStyle();
            if(angular.isFunction(defaultStyle)) {
                defaultStyle = defaultStyle()[0];
            }

            if(objCount > 1) {
                var styleDefinition = angular.extend({}, value.layer.style);
                if(i % 2 === 0) {
                    styleDefinition.graphicXAnchor = lastXAnchor + i;
                } else {
                    styleDefinition.graphicXAnchor = lastXAnchor - i;
                }

                lastXAnchor = styleDefinition.graphicXAnchor;

                styleDefinition.graphicXAnchor += even ? 1.0 : 0.5;
                styleDefinition.graphicXAnchor *= styleDefinition.graphicWidth;

                styles.push(
                    new ol.style.Style({
                        image: self.createIconStyle(styleDefinition, defaultStyle.getImage()),
                        text: new ol.style.Text({
                            text: value.count.toString(),
                            offsetX: (styleDefinition.graphicXAnchor - styleDefinition.graphicWidth / 2) * -1,
                            offsetY: styleDefinition.graphicHeight,
                            stroke: new ol.style.Stroke({color: '#fff', width: 2})
                        })
                    })
                );
            } else {
                styles.push(defaultStyle);
                styles.push(new ol.style.Style({
                    text: new ol.style.Text({
                        text: value.count.toString(),
                        offsetY: value.layer.style.graphicHeight,
                        stroke: new ol.style.Stroke({color: '#fff', width: 2})
                    })
                }));
            }
            i++;
        });
        clusterFeature.set('cachedStyle', styles);
        return styles;

    },
    refresh: function() {
        this.olSource.clear();
        this.olSource.refresh();
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.Group
 *
 * @param {Object} options AnOl group options
 * @param {string} options.name Unique group name
 * @param {string} options.title Title for group
 * @param {Array<anol.layer.Layer>} options.layers AnOl layers to group
 *
 * @description
 * Groups {@link anol.layer.Layer anol.layer.Layer}.
 */
 // TODO think about rebasing into anol.Group
anol.layer.Group = function(options) {
    var self = this;
    this.name = options.name;
    this.title = options.title;
    this.layers = options.layers;
    angular.forEach(this.layers, function(layer) {
        layer.anolGroup = self;
    });
};
anol.layer.Group.prototype = {
    CLASS_NAME: 'anol.layer.Group',
    getVisible: function() {
        var self = this;
        var visible = false;
        $.each(self.layers, function(idx, layer) {
            if(layer.getVisible()) {
                visible = true;
                return false;
            }
        });
        return visible;
    },
    setVisible: function(visible) {
        var self = this;
        $.each(self.layers, function(idx, layer) {
            if(layer.getVisible() !== visible) {
                layer.setVisible(visible);
            }
        });
    }
};
;
/**
 * @ngdoc object
 * @name anol.layer.SingleTileWMS
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Image
 * @param {Object} options.olLayer.source Options for ol.source.ImageWMS
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
 anol.layer.SingleTileWMS = function(_options) {
    var defaults = {};
    var options = $.extend(true, {}, defaults, _options);

    anol.layer.BaseWMS.call(this, options);
};
anol.layer.SingleTileWMS.prototype = new anol.layer.BaseWMS(false);
$.extend(anol.layer.SingleTileWMS.prototype, {
    CLASS_NAME: 'anol.layer.SingleTileWMS',
    OL_LAYER_CLASS: ol.layer.Image,
    OL_SOURCE_CLASS: ol.source.ImageWMS,
    _createSourceOptions: function(srcOptions) {
        srcOptions = anol.layer.BaseWMS.prototype._createSourceOptions.call(this, srcOptions);
        if(srcOptions.ratio === undefined) {
            srcOptions.ratio = 1;
        }
        return srcOptions;
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.TiledWMS
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Tile
 * @param {Object} options.olLayer.source Options for ol.source.TileWMS
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
 anol.layer.TiledWMS = function(_options) {
    var defaults = {};
    var options = $.extend(true, {}, defaults, _options );
    anol.layer.BaseWMS.call(this, options);
};
anol.layer.TiledWMS.prototype = new anol.layer.BaseWMS(false);
$.extend(anol.layer.TiledWMS.prototype, {
    CLASS_NAME: 'anol.layer.TiledWMS',
    OL_LAYER_CLASS: ol.layer.Tile,
    OL_SOURCE_CLASS: ol.source.TileWMS
});
;
/**
 * @ngdoc object
 * @name anol.layer.TMS
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Tile
 * @param {Object} options.olLayer.source Options for ol.source.TileImage
 * @param {string} options.olLayer.source.baseUrl BaseUrl for TMS requests
 * @param {string} options.olLayer.source.layer Requested layer
 * @param {Array<number>} options.olLayer.source.resolutions List of resolutions
 * @param {string} options.olLayer.source.format Image format
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 */
 anol.layer.TMS = function(_options) {
    var defaults = {
        olLayer: {
            source: {
                tileSize: [256, 256],
                levels: 22
            }
        }
    };
    var options = $.extend(true, {}, defaults, _options);

    anol.layer.Layer.call(this, options);
};
anol.layer.TMS.prototype = new anol.layer.Layer(false);
$.extend(anol.layer.TMS.prototype, {
    CLASS_NAME: 'anol.layer.TMS',
    OL_LAYER_CLASS: ol.layer.Tile,
    OL_SOURCE_CLASS: ol.source.XYZ,
    /**
     * Additional source options:
     * - baseUrl
     * - layer
     * - extent
     * - format
     */
    _createSourceOptions: function(srcOptions) {
        var self = this;
        srcOptions = anol.layer.Layer.prototype._createSourceOptions(srcOptions);

        srcOptions.tileUrlFunction = function(tileCoord, pixelRatio, projection) {
            return self.tileUrlFunction(
                tileCoord,
                srcOptions.baseUrl,
                srcOptions.layer,
                srcOptions.format
            );
        };
        if(
            srcOptions.tileGrid === undefined &&
            srcOptions.extent !== undefined
        ) {
            var w = ol.extent.getWidth(extent);
            var h = ol.extent.getHeight(extent);
            var minRes = Math.max(w / sourceOpts.tileSize[0], h / sourceOpts.tileSize[1]);
            srcOptions.tileGrid = new ol.tilegrid.TileGrid({
                origin: ol.extent.getBottomLeft(srcOptions.extent),
                resolutions: self._createResolutions(
                    minRes,
                    srcOptions.levels
                )
            });
        }
        return srcOptions;
    },
    _createResolutions: function(minRes, levels) {
        var resolutions = [];
        // need one resolution more
        for(var z = 0; z <= levels; ++z) {
            resolutions[z] = minRes / Math.pow(2, z);
        }
        // becouse first resolutions is removed
        // so ol requests 4 tiles instead of one for first zoom level
        resolutions.shift();
        return resolutions;
    },
    tileUrlFunction: function(tileCoord, baseUrl, layer, format) {
        var url = '';
        if (tileCoord[1] >= 0 && tileCoord[2] >= 0) {
            url += baseUrl + '/';
            url += layer + '/';
            url += tileCoord[0].toString() + '/';
            url += tileCoord[1].toString() + '/';
            url += tileCoord[2].toString();
            url += '.' + format.split('/')[1];
        }
        return url;
    },
    isCombinable: function(other) {
        var combinable = anol.layer.Layer.prototype.isCombinable.call(this, other);
        return false;
    }
});
;
/**
 * @ngdoc object
 * @name anol.layer.WMTS
 *
 * @param {Object} options AnOl Layer options
 * @param {Object} options.olLayer Options for ol.layer.Tile
 * @param {Object} options.olLayer.source Options for ol.source.WMTS
 * @param {string} options.olLayer.source.capabilitiesUrl Url to WMTS capabilities document
 *
 * @description
 * Inherits from {@link anol.layer.Layer anol.layer.Layer}.
 *
 * In options.olLayer.source you can either specify *capabilitiesUrl*
 * or *url*, *layer*, *format* and *extent*.
 * For both variants, *projection* and *matrixSet* is required.
 * Without capabilitiesUrl you can also specify *levels* in source options.
 * The default value is 22.
 */
anol.layer.WMTS = function(_options) {
    var self = this;
    var defaults = {
        olLayer: {
            source: {
                tileSize: [256, 256],
                levels: 22
            }
        }
    };
    var options = $.extend(true, {}, defaults, _options );

    var hqUrl = options.olLayer.source.hqUrl || false;
    delete options.olLayer.source.hqUrl;
    var hqLayer = options.olLayer.source.hqLayer || false;
    delete options.olLayer.source.hqLayer;
    var hqMatrixSet = options.olLayer.source.hqMatrixSet || false;
    delete options.olLayer.source.hqMatrixSet;

    if(ol.has.DEVICE_PIXEL_RATIO > 1) {
        var useHq = false;
        if(hqUrl !== false) {
            options.olLayer.source.url = hqUrl;
            useHq = true;
        }
        if(hqLayer !== false) {
            options.olLayer.source.layer = hqLayer;
            useHq = true;
        }
        if(hqMatrixSet !== false) {
            options.olLayer.source.matrixSet = hqMatrixSet;
            useHq = true;
        }
        if(useHq) {
            options.olLayer.source.tilePixelRatio = 2;
         }
    }

    anol.layer.Layer.call(this, options);
};
anol.layer.WMTS.prototype = new anol.layer.Layer(false);
$.extend(anol.layer.WMTS.prototype, {
    CLASS_NAME: 'anol.layer.WMTS',
    OL_LAYER_CLASS: ol.layer.Tile,
    OL_SOURCE_CLASS: ol.source.WMTS,
    _createResolution: function(levels, minRes) {
        var resolutions = [];
        for(var z = 0; z < levels; ++z) {
            resolutions[z] = minRes / Math.pow(2, z);
        }
        return resolutions;
    },
    _createMatrixIds: function(levels) {
        var matrixIds = [];
        for(var z = 0; z < levels; ++z) {
            matrixIds[z] = z;
        }
        return matrixIds;
    },
    _createRequestUrl: function(options) {
        return options.url +
               options.layer +
               '/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.' +
               options.format.split('/')[1];
    },
    _createSourceOptions: function(srcOptions) {
        srcOptions = anol.layer.Layer.prototype._createSourceOptions(srcOptions);
        var levels = srcOptions.levels;
        var extent = srcOptions.extent || srcOptions.projection.getExtent();
        var w = ol.extent.getWidth(extent);
        var h = ol.extent.getHeight(extent);
        var minRes = Math.max(w / srcOptions.tileSize[0], h / srcOptions.tileSize[1]);
        var url = this._createRequestUrl(srcOptions);

        srcOptions = $.extend(true, {}, srcOptions, {
            url: url,
            tileGrid: new ol.tilegrid.WMTS({
                extent: extent,
                origin: ol.extent.getTopLeft(extent),
                resolutions: this._createResolution(levels, minRes),
                matrixIds: this._createMatrixIds(levels)
            }),
            requestEncoding: 'REST',
            style: 'default'
        });

        return srcOptions;
    },
    isCombinable: function(other) {
        var combinable = anol.layer.Layer.prototype.isCombinable.call(this, other);
        return false;
    }
});
;
/**
 * @ngdoc overview
 * @name anol
 * @description
 * Base anol module
 */
angular.module('anol', ['ui.bootstrap', 'pascalprecht.translate', 'ngSanitize'])
/**
 * @ngdoc object
 * @name anol.constant:DefaultMapName
 * @description
 * Id and class added to ol.Map DOM-element
 */
.constant('DefaultMapName', 'anol-map')
// found at http://stackoverflow.com/a/21098541
.filter('html',['$sce', function($sce) {
    return function(input){
        return $sce.trustAsHtml(input);
    };
}])
.config(['$translateProvider', function($translateProvider) {
    $translateProvider.useSanitizeValueStrategy('escape');
    // define default language
    // see https://angular-translate.github.io/docs/#/guide/12_asynchronous-loading 'FOUC - Flash of untranslated content'
    $translateProvider.translations('en_US', {
        'anol': {
            'attribution': {
                'TOOLTIP': 'Attributions'
            },
            'draw': {
                'TOOLTIP_POINT': 'Draw point',
                'TOOLTIP_LINE': 'Draw line',
                'TOOLTIP_POLYGON': 'Draw polygon',
                'LAYER_TITLE': 'Draw layer'
            },
            'featureexchange': {
                'NO_JSON_FORMAT': 'No json format',
                'INVALID_GEOJSON': 'No valid geojson given',
                'EMPTY_GEOJSON': 'Empty geojson given',
                'COULD_NOT_READ_FILE': 'Could not read file'
            },
            'featurepropertieseditor': {
                'NEW_PROPERTY': 'New property'
            },
            'featurestyleeditor': {
                'RADIUS': 'Radius',
                'LINE_COLOR': 'Line color',
                'LINE_WIDTH': 'Line width',
                'LINE_OPACITY': 'Line opacity',
                'LINE_DASHSTYLE': 'Line dashstyle',
                'FILL_COLOR': 'Fill color',
                'FILL_OPACITY': 'Fill opacity',
                'SOLID': 'Solid',
                'DOT': 'Dotted',
                'DASH': 'Dashed',
                'DASHDOT': 'Dashed & dotted',
                'LONGDASH': 'Long dashed',
                'LONGDASHDOT': 'Long dashed & dotted'
            },
            'geocoder': {
                'PLACEHOLDER': 'Street, City',
                'NO_RESULTS': 'No results found',
                'SEARCH_IN_PROGRESS': 'Search in progress'
            },
            'geolocation': {
                'TOOLTIP': 'Start geolocation',
                'POSITION_OUT_OF_MAX_EXTENT': 'Your position is not in map extent'
            },
            'layerswitcher': {
                'TOOLTIP': 'Toggle layerswitcher',
                'BACKGROUNDS': 'Background layers',
                'OVERLAYS': 'Overlay layers'
            },
            'legend': {
                'TOOLTIP': 'Toggle legend',
                'SHOW': 'Show legend'
            },
            'measure': {
                'TOOLTIP_MEASURE_LINE': 'Measure line',
                'TOOLTIP_MEASURE_AREA': 'Measure area'
            },
            'overviewmap': {
                'TOOLTIP': 'Toggle overview map'
            },
            'print': {
                'PAGE_LAYOUTS': 'Page sizes',
                'SCALE': 'Scale',
                'OUTPUT_FORMAT': 'Output format',
                'REMOVE_PRINT_AREA': 'Remove print area',
                'START_PRINT': 'Start printing',
                'OUTPUT_PREPARED': 'Printing in progress.\nThis may take a moment.',
                'DOWNLOAD_READY': 'Printing finished',
                'DOWNLOAD': 'Download it',
                'ERROR': 'Sorry! An error occured.\nPleace try again later.',
                'INVALID_SCALE': 'No valid scale',
                'PAGE_WIDTH': 'Width',
                'PAGE_HEIGHT': 'Height',
                'INVALID_WIDTH': 'Invalid width',
                'INVALID_HEIGHT': 'Invalid height',
                'WIDTH_REQUIRED': 'Width required',
                'HEIGHT_REQUIRED': 'Height required',
                'WIDTH_TOO_SMALL': 'Width too small. Min width: ',
                'HEIGHT_TOO_SMALL': 'Height too small. Min height: ',
                'WIDTH_TOO_BIG': 'Width too big. Max width: ',
                'HEIGHT_TOO_BIG': 'Height too big. Max height: '
            },
            'savemanager': {
                'SERVICE_UNAVAILABLE': 'Service unavailable'
            },
            'zoom': {
                'TOOLTIP_ZOOM_IN': 'Zoom in',
                'TOOLTIP_ZOOM_OUT': 'Zoom out'
            },
            'validationErrors': {
                'min': 'Value must be greater than {{ min }}',
                'max': 'Value must be lower than {{ max }}',
                'color': 'Invalid color format',
                'number': 'Value is not a number'
            }
        }
    });
    $translateProvider.preferredLanguage('en_US');
}]);
;
/**
 * @ngdoc overview
 * @name anol.attribution
 * @description
 * Module providing the geolocate directive
 */
angular.module('anol.attribution', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.catalog
 * @description
 * Module providing the catalog directive
 */
angular.module('anol.catalog', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.draw
 * @description
 * Module providing the draw directive
 */
angular.module('anol.draw', ['anol.map']);
;
angular.module('anol.featureexchange', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.featurepopup
 * @description
 * Module providing the featurepopup directive
 */
angular.module('anol.featurepopup', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.featureproperties
 * @description
 * Module providing the featureproperties directive
 */
angular.module('anol.featureproperties', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.featurepropertieseditor
 * @description
 * Module providing the feature properties editor directive
 */
angular.module('anol.featurepropertieseditor', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.featurestyleeditor
 * @description
 * Module providing the feature style editor directive
 */
angular.module('anol.featurestyleeditor', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.geocoder
 * @description
 * Module providing the geocoder directive
 */
angular.module('anol.geocoder', ['anol.map']);;
/**
 * @ngdoc overview
 * @name anol.geolocation
 * @description
 * Module providing the geolocate directive
 */
angular.module('anol.geolocation', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.getfeatureinfo
 * @description
 * Module providing the getfeatureinfo directive
 */
angular.module('anol.getfeatureinfo', ['anol.map', 'anol.featurepopup']);
;
/**
 * @ngdoc overview
 * @name anol.layerswitcher
 * @description
 * Module providing the layerswitcher directive
 */
angular.module('anol.layerswitcher', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.featurepopup
 * @description
 * Module providing the featurepopup directive
 */
angular.module('anol.legend', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.map
 * @description
 * Module providing ol3 map related services and directives
 */
angular.module('anol.map', ['anol', 'anol.featurepopup']);
;
/**
 * @ngdoc overview
 * @name anol.map
 * @description
 * Module providing ol3 map related services and directives
 */
angular.module('anol.measure', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.mouseposition
 * @description
 * Module containing mouseposition directive
 */
angular.module('anol.mouseposition', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.overviewmap
 * @description
 * Module providing the overview map directive
 */
angular.module('anol.overviewmap', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.permalink
 * @description
 * Module containing permalink service
 */
angular.module('anol.permalink', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.print
 * @description
 * Module containing printpage service
 */
angular.module('anol.print', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.rotate
 * @description
 * Module providing the rotation directive
 */
angular.module('anol.rotation', ['anol.map']);
;
angular.module('anol.savemanager', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.scale
 * @description
 * Module containung scale related directives
 */
angular.module('anol.scale', ['anol.map']);
;
/**
 * @ngdoc overview
 * @name anol.urlmarkers
 * @description
 * Module providing urlmarkers related services and directives
 */
angular.module('anol.urlmarkers', ['anol.map', 'anol.featurepopup']);
;
/**
 * @ngdoc overview
 * @name anol.zoom
 * @description
 * Module providing the zoom directive
 */
angular.module('anol.zoom', ['anol.map']);
;
angular.module('anol.map')

 /**
 * @ngdoc object
 * @name anol.map.MapServiceProvider
 *
 * @description
 * MapService handles ol3 map creation including adding interactions, controls and layers to it.
 *
 * The ol.View is added with the provider method addView
 * It will only create one instance of an ol map
 */
.provider('MapService', [function() {
    var _view, _bbox;
    var _cursorPointerConditions = [];
    var _twoFingersPinchDrag = false;
    var _twoFingersPinchDragText = 'Use two fingers to move the map';
    /**
     * @ngdoc method
     * @name addView
     * @methodOf anol.map.MapServiceProvider
     *
     * @param {ol.View} view ol3 view object
     *
     * @description
     * Set the map view
     */
    this.addView = function(view) {
        _view = view;
    };

    /**
     * @ngdoc method
     * @name setInitialBBox
     * @methodOf anol.map.MapServiceProvider
     *
     * @param {ol.Extent} bbox Initial bbox
     *
     * @description
     * Set initial bbox
     */
    this.setInitialBBox = function(bbox) {
        _bbox = bbox;
    };

    /**
     * @ngdoc method
     * @name addCursorPointerCondition
     * @methodOf anol.map.MapServiceProvider
     *
     * @param {function} conditionFunc Function called on ol3 map pointermove event
     *
     * @description
     * Adds function to list of called functions on ol3 map pointermove event.
     * Function must return boolean. When true, cursor is changed to pointer
     */
    this.addCursorPointerCondition = function(conditionFunc) {
        _cursorPointerConditions.push(conditionFunc);
    };

    this.setTwoFingersPinchDrag = function(enabled) {
        _twoFingersPinchDrag = enabled;
    };

    this.setTwoFingersPinchDragText = function(text) {
        _twoFingersPinchDragText = text;
    }

    this.$get = [function() {
        /**
         * @ngdoc service
         * @name anol.map.MapService
         *
         * @requires anol.map.LayersService
         * @requires anol.map.ControlsService
         * @requires anol.map.InteractionsService
         *
         * @description
         * MapService handles ol3 map creation including adding interactions, controls and layers to it.
         *
         * The ol.View is added with the provider method addView
         * It will only create one instance of an ol map
         */
        var MapService = function(view, cursorPointerConditions, twoFingersPinchDrag, twoFingersPinchDragText) {
            this.view = view;
            this.map = undefined;
            this.hasTouch = ol.has.TOUCH;
            this.cursorPointerConditions = cursorPointerConditions;
            this.twoFingersPinchDrag = twoFingersPinchDrag;
            this.twoFingersPinchDragText = twoFingersPinchDragText;
        };
        /**
         * @ngdoc method
         * @name getMap
         * @methodOf anol.map.MapService
         *
         * @returns {Object} ol.Map
         *
         * @description
         * Get the current ol map. If not previosly requested, a new map
         * is created.
         */
        MapService.prototype.getMap = function() {
            if(angular.isUndefined(this.map)) {
                this.map = new ol.Map(angular.extend({}, {
                    logo: false,
                    controls: [],
                    interactions: [],
                    layers: [],
                    loadTilesWhileInteracting: true
                }));
                this.map.setView(this.view);
                if(angular.isDefined(_bbox)) {
                    this.map.once('change:target', function() {
                        this.map.getView().fit(_bbox, this.map.getSize());
                    });
                }
                if(this.cursorPointerConditions.length > 0) {
                    this.map.on('pointermove', this._changeCursorToPointer, this);
                }
            }
            return this.map;
        };
        /**
         * @private
         *
         * ol3 map pointermove event callback
         */
        MapService.prototype._changeCursorToPointer = function(evt) {
            var self = this;
            var pixel = self.map.getEventPixel(evt.originalEvent);
            var hit = false;
            angular.forEach(self.cursorPointerConditions, function(conditionFunc) {
                if(hit === true) {
                    return;
                }
                hit = conditionFunc(pixel);
            });
            self.map.getTarget().style.cursor = hit ? 'pointer' : '';
        };
        /**
         * @ngdoc method
         * @name addCursorPointerCondition
         * @methodOf anol.map.MapService
         *
         * @param {function} conditionFunc Function called on ol3 map pointermove event
         *
         * @description
         * Adds function to list of called functions on ol3 map pointermove event.
         * Function must return boolean. When true, cursor is changed to pointer
         */
        MapService.prototype.addCursorPointerCondition = function(conditionFunc) {
            var idx = this.cursorPointerConditions.indexOf(conditionFunc);
            if(idx !== -1) {
                return;
            }
            this.cursorPointerConditions.push(conditionFunc);
            if(this.cursorPointerConditions.length === 1) {
                this.map.on('pointermove', this._changeCursorToPointer, this);
            }
        };
        /**
         * @ngdoc method
         * @name removeCursorPointerCondition
         * @methodOf anol.map.MapService
         *
         * @param {function} conditionFunc Function to remove
         *
         * @description
         * Removes given function from list of called functions on ol3 map pointermove event
         */
        MapService.prototype.removeCursorPointerCondition = function(conditionFunc) {
            var idx = this.cursorPointerConditions.indexOf(conditionFunc);
            if(idx === -1) {
                return;
            }
            this.cursorPointerConditions.splice(idx, 1);
            if(this.cursorPointerConditions.length === 0) {
                this.map.un('pointermove', this._changeCursorToPointer, this);
            }
        };
        return new MapService(_view, _cursorPointerConditions, _twoFingersPinchDrag, _twoFingersPinchDragText);
    }];
}]);
;
angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.LayersServiceProvider
 */
.provider('LayersService', [function() {
    var _layers = [];
    var _addLayerHandlers = [];
    var _removeLayerHandlers = [];
    var _clusterDistance = 50;
    /**
     * @ngdoc method
     * @name setLayers
     * @methodOf anol.map.LayersServiceProvider
     * @param {Array.<Object>} layers ol3 layers
     */
    this.setLayers = function(layers) {
        _layers = _layers.concat(layers);
    };
    this.setClusterDistance = function(distance) {
        _clusterDistance = distance;
    };
    /**
     * @ngdoc method
     * @name registerAddLayerHandler
     * @methodOf anol.map.LayersServiceProvider
     * @param {function} handler
     * register a handler called for each added layer
     */
    this.registerAddLayerHandler = function(handler) {
        _addLayerHandlers.push(handler);
    };

    this.registerRemoveLayerHandler = function(handler) {
        _removeLayerHandlers.push(handler);
    };

    this.$get = ['$rootScope', 'MapService', 'PopupsService', function($rootScope, MapService, PopupsService) {
        /**
         * @ngdoc service
         * @name anol.map.LayersService
         *
         * @description
         * Stores ol3 layerss and add them to map, if map present
         */
        var Layers = function(layers, addLayerHandlers, removeLayerHandlers, clusterDistance) {
            var self = this;
            self.map = undefined;
            self.addLayerHandlers = addLayerHandlers;
            self.removeLayerHandlers = removeLayerHandlers;
            self.clusterDistance = clusterDistance;

            // contains all anol background layers
            self.backgroundLayers = [];
            // contains all anol overlay layers or groups
            self.overlayLayers = [];
            // contains all anol layers used internaly by modules
            self.systemLayers = [];
            self.nameLayersMap = {};
            self.nameGroupsMap = {};

            self.olLayers = [];

            self.addedLayers = [];

            angular.forEach(layers, function(layer) {
                if(layer.isBackground) {
                    self.addBackgroundLayer(layer);
                } else {
                    self.addOverlayLayer(layer);
                }
            });

            var activeBackgroundLayer;
            angular.forEach(self.backgroundLayers, function(backgroundLayer) {
                if(angular.isUndefined(activeBackgroundLayer) && backgroundLayer.getVisible()) {
                    activeBackgroundLayer = backgroundLayer;
                }
            });
            if(angular.isUndefined(activeBackgroundLayer) && self.backgroundLayers.length > 0) {
                activeBackgroundLayer = self.backgroundLayers[0];
            }
            angular.forEach(self.backgroundLayers, function(backgroundLayer) {
                backgroundLayer.setVisible(angular.equals(activeBackgroundLayer, backgroundLayer));
            });
        };
        /**
         * @ngdoc method
         * @name registerMap
         * @methodOf anol.map.LayersService
         * @param {Object} map ol3 map object
         * @description
         * Register an ol3 map in `LayersService`
         */
        Layers.prototype.registerMap = function(map) {
            var self = this;
            self.map = map;
            angular.forEach(self.backgroundLayers, function(layer) {
                self._addLayer(layer, true);
            });
            angular.forEach(self.overlayLayers, function(layer) {
                if(layer instanceof anol.layer.Group) {
                    angular.forEach(layer.layers.slice().reverse(), function(grouppedLayer) {
                        if(self.olLayers.indexOf(grouppedLayer.olLayer) < 0) {
                            self._addLayer(grouppedLayer);
                        }
                    });
                } else {
                    if(self.olLayers.indexOf(layer.olLayer) < 0) {
                        self._addLayer(layer);
                    }
                }
            });
            angular.forEach(self.systemLayers, function(layer) {
                self._addLayer(layer, true);
            });
        };
        /**
         * @ngdoc method
         * @name addBackgroundLayer
         * @methodOf anol.map.LayersService
         * @param {anol.layer} layer Background layer to add
         * @param {number} idx Position to add backgorund layer at
         * @description
         * Adds a background layer
         */
        Layers.prototype.addBackgroundLayer = function(layer, idx) {
            var self = this;
            idx = idx || self.backgroundLayers.length;
            self.backgroundLayers.splice(idx, 0, layer);
            self._prepareLayer(layer);
        };
        /**
         * @ngdoc method
         * @name addOverlayLayer
         * @methodOf anol.map.LayersService
         * @param {anol.layer} layer Overlay layer to add
         * @param {number} idx Position to add overlay layer at
         * @description
         * Adds a overlay layer
         */
        Layers.prototype.addOverlayLayer = function(layer, idx) {
            var self = this;
            // prevent adding layer twice
            if(self.overlayLayers.indexOf(layer) > -1) {
                return false;
            }
            // layers added reversed to map, so default idx is 0 to add layer "at top"
            idx = idx || 0;
            self.overlayLayers.splice(idx, 0, layer);
            self._prepareLayer(layer);
            if(layer instanceof anol.layer.Group) {
                angular.forEach(layer.layers, function(_layer) {
                    _layer.onVisibleChange(function() {
                        PopupsService.closeAll();
                    });
                });
            } else {
                layer.onVisibleChange(function() {
                    PopupsService.closeAll();
                });
            }
            return true;
        };
        Layers.prototype.removeOverlayLayer = function(layer) {
            var self = this;
            if(self.overlayLayers.indexOf(layer) === -1) {
                return false;
            }
            var layers = [layer];
            if(layer instanceof anol.layer.Group) {
                layers = layer.layers;
                if(layer.name !== undefined) {
                    delete self.nameGroupsMap[layer.name];
                }
            }

            angular.forEach(layers, function(_layer) {
                var addedLayersIdx = self.addedLayers.indexOf(_layer);
                if(addedLayersIdx > -1) {
                    self.addedLayers.splice(addedLayersIdx, 1);
                }

                var overlayLayerIdx = self.overlayLayers.indexOf(_layer);
                if(overlayLayerIdx > -1) {
                    self.overlayLayers.splice(overlayLayerIdx, 1);
                }

                if(self.map !== undefined) {
                    var olLayerIdx = self.olLayers.indexOf(_layer.olLayer);
                    if(olLayerIdx > -1) {
                        self.map.removeLayer(_layer.olLayer);
                        self.olLayers.splice(olLayerIdx, 1);
                    }
                }
                angular.forEach(self.removeLayerHandlers, function(handler) {
                    handler(_layer);
                });
                _layer.removeOlLayer();
            });
        };
        /**
         * @ngdoc method
         * @name addSystemLayer
         * @methodOf anol.map.LayersService
         * @param {anol.layer} layer Overlay layer to add
         * @param {number} idx Position to add overlay layer at
         * @description
         * Adds a system layer. System layers should only created and added by
         * anol components
         */
        Layers.prototype.addSystemLayer = function(layer, idx) {
            var self = this;
            idx = idx || 0;
            self.systemLayers.splice(idx, 0, layer);
        };
        /**
         * private function
         * Creates olLayer
         */
        Layers.prototype.createOlLayer = function(layer) {
            var olSource;
            var lastAddedLayer = this.lastAddedLayer();
            if(lastAddedLayer !== undefined && lastAddedLayer.isCombinable(layer)) {
                olSource = lastAddedLayer.getCombinedSource(layer);
                if(layer instanceof anol.layer.DynamicGeoJSON && layer.isClustered()) {
                    layer.unclusteredSource = lastAddedLayer.unclusteredSource;
                }
                layer.combined = true;
            }
            if(olSource === undefined) {
                var sourceOptions = angular.extend({}, layer.olSourceOptions);
                if(layer.isClustered()) {
                    sourceOptions.distance = this.clusterDistance;
                }
                olSource = new layer.OL_SOURCE_CLASS(sourceOptions);
                olSource.set('anolLayers', [layer]);
            }

            var layerOpts = angular.extend({}, layer.olLayerOptions);
            layerOpts.source = olSource;
            var olLayer = new layer.OL_LAYER_CLASS(layerOpts);

            // only instances of BaseWMS are allowed to share olLayers
            // TODO allow also DynamicGeoJSON layer to share olLayers
            if(layer.combined && layer instanceof anol.layer.BaseWMS &&
               angular.equals(layer.olLayerOptions,lastAddedLayer.olLayerOptions)
            ) {
                layer.setOlLayer(lastAddedLayer.olLayer);
                // TODO add layer to anolLayers of lastAddedLayer when anolLayer refactored anolLayers
                return lastAddedLayer.olLayer;
            }
            // TODO refactor to anolLayers with list of layers
            // HINT olLayer.anolLayer is used in featurepopup-, geocoder- and geolocation-directive
            //      this will only affacts DynamicGeoJsonLayer
            olLayer.set('anolLayer', layer);
            layer.setOlLayer(olLayer);

            return olLayer;
        };
        /**
         * private function
         * Adds layer to internal lists, executes addLayer handlers and calls _addLayer
         */
        Layers.prototype._prepareLayer = function(layer) {
            var self = this;

            var layers = [layer];
            if(layer instanceof anol.layer.Group) {
                if(layer.name !== undefined) {
                    self.nameGroupsMap[layer.name] = layer;
                }
                layers = layer.layers;
            }

            angular.forEach(layers, function(_layer) {
                if(_layer.name !== undefined) {
                    self.nameLayersMap[_layer.name] = _layer;
                }
            });

            angular.forEach(layers, function(_layer) {
                self.createOlLayer(_layer);
                self.addedLayers.push(_layer);
                if (_layer.options !== undefined && _layer.options.visible) {
                    _layer.setVisible(true);
                }
                angular.forEach(self.addLayerHandlers, function(handler) {
                    handler(_layer);
                });
            });

            // while map is undefined, don't add layers to it
            // when map is created, all this.layers are added to map
            // after that, this.map is registered
            // so, when map is defined, added layers are not in map
            // and must be added
            if(self.map !== undefined) {
                if(layer instanceof anol.layer.Group) {
                    angular.forEach(layer.layers, function(_layer) {
                        if(self.olLayers.indexOf(_layer.olLayer) < 0) {
                            self._addLayer(_layer);
                        }
                    });
                } else {
                    if(self.olLayers.indexOf(layer.olLayer) < 0) {
                        self._addLayer(layer);
                    }
                }
            }
        };
        /**
         * private function
         * Add layer to map and execute postAddToMap function of layer
         */
        Layers.prototype._addLayer = function(layer, skipLayerIndex) {
            this.map.addLayer(layer.olLayer);
            layer.map = this.map;

            if(skipLayerIndex !== true) {
                this.olLayers.push(layer.olLayer);
            }
        };
        /**
         * @ngdoc method
         * @name layers
         * @methodOf anol.map.LayersService
         * @returns {array.<anol.layer.Layer>} All layers, including groups
         * @description
         * Get all layers managed by layers service
         */
        Layers.prototype.layers = function() {
            var self = this;
            return self.backgroundLayers.concat(self.overlayLayers);
        };
        /**
         * @ngdoc method
         * @name flattedLayers
         * @methodOf anol.map.LayersService
         * @returns {Array.<anol.layer.Layer>} flattedLayers
         * @description
         * Returns all layers except groups. Grouped layers extracted from their gropus.
         */
        Layers.prototype.flattedLayers = function() {
            var self = this;
            var flattedLayers = [];
            angular.forEach(self.layers(), function(layer) {
                if(layer instanceof anol.layer.Group) {
                    flattedLayers = flattedLayers.concat(layer.layers);
                } else {
                    flattedLayers.push(layer);
                }
            });
            return flattedLayers;
        };
        /**
         * @ngdoc method
         * @name activeBbackgroundLayer
         * @methodOf anol.map.LayersService
         * @returns {anol.layer.Layer} backgroundLayer visible background layer
         * @description
         * Returns the visible background layer
         */
        Layers.prototype.activeBackgroundLayer = function() {
            var self = this;
            var backgroundLayer;
            angular.forEach(self.backgroundLayers, function(layer) {
                if(layer.getVisible() === true) {
                    backgroundLayer = layer;
                }
            });
            return backgroundLayer;
        };
        /**
         * @ngdoc method
         * @name layerByName
         * @methodOf anol.map.LayersService
         * @param {string} name
         * @returns {anol.layer.Layer} layer
         * @description Gets a layer by it's name
         */
        Layers.prototype.layerByName = function(name) {
            return this.nameLayersMap[name];
        };
        /**
         * @ngdoc method
         * @name groupByName
         * @methodOf anol.map.LayersService
         * @param {string} name
         * @returns {anol.layer.Group} group
         * @description Gets a group by it's name
         */
        Layers.prototype.groupByName = function(name) {
            return this.nameGroupsMap[name];
        };
        Layers.prototype.lastAddedLayer = function() {
            var idx = this.addedLayers.length - 1;
            if(idx > -1) {
                return this.addedLayers[idx];
            }
        };
        Layers.prototype.registerRemoveLayerHandler = function(handler) {
            this.removeLayerHandlers.push(handler);
        };
        Layers.prototype.registerAddLayerHandler = function(handler) {
            this.addLayerHandlers.push(handler);
        };
        return new Layers(_layers, _addLayerHandlers, _removeLayerHandlers, _clusterDistance);
    }];
}]);
;
angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.ClusterSelectServiceProvider
 */
.provider('ClusterSelectService', ['LayersServiceProvider', function(LayersServiceProvider) {
    var _clusterServiceInstance;
    var _clusterSelectOptions;
    var _clusterLayers = [];

    LayersServiceProvider.registerAddLayerHandler(function(layer) {
        if(!layer.isClustered()) {
            return;
        }
        if(angular.isDefined(_clusterServiceInstance)) {
            _clusterServiceInstance.addLayer(layer);
        } else {
            _clusterLayers.push(layer);
        }
    });

    LayersServiceProvider.registerRemoveLayerHandler(function(layer) {
        if(!layer.isClustered()) {
            return;
        }
        if(angular.isDefined(_clusterServiceInstance)) {
            _clusterServiceInstance.removeLayer(layer);
        } else {
            var idx = _clusterLayers.indexOf(layer);
            if(idx > -1) {
                _clusterLayers.splice(idx, 1);
            }
        }
    });

    this.setClusterSelectOptions = function(options) {
        _clusterSelectOptions = options;
    };

    this.$get = ['MapService', function(MapService) {

        var defaultClusterOptions = {
            selectCluster: true,
            pointRadius: 10,
            spiral: true,
            circleMaxObjects: 10,
            maxObjects: 20,
            maxZoomLevel: 18,
            animate: false,
            animationDuration: 500
        };

        var ClusterSelect = function(clusterSelectOptions, clusterLayers) {
            var self = this;
            this.clusterLayers = [];
            this.selectRevealedFeatureCallbacks = [];
            this.clusterSelectOptions = clusterSelectOptions;

            angular.forEach(clusterLayers, function(layer) {
                self.addLayer(layer);
            });
        };

        ClusterSelect.prototype.registerSelectRevealedFeatureCallback = function(f) {
            this.selectRevealedFeatureCallbacks.push(f);
        };

        ClusterSelect.prototype.handleLayerVisibleChange = function(e) {
            this.selectClusterInteraction.clear();
        };

        ClusterSelect.prototype.addLayer = function(layer) {
            layer.olLayer.on('change:visible', this.handleLayerVisibleChange, this);
            this.clusterLayers.push(layer);
        };

        ClusterSelect.prototype.removeLayer = function(layer) {
            layer.olLayer.un('change:visible', this.handleLayerVisibleChange, this);
            var idx = this.clusterLayers.indexOf(layer);
            if(idx > -1) {
                this.clusterLayers.splice(idx, 1);
                this.selectClusterInteraction.clear();
            }
        };

        ClusterSelect.prototype.layerByFeature = function(feature) {
            var self = this;
            var resultLayer;
            // TODO collect all anol.layer.Feature into a list
            angular.forEach(self.clusterLayers, function(layer) {
                if(angular.isDefined(resultLayer)) {
                    return;
                }
                if(layer.unclusteredSource.getFeatures().indexOf(feature) > -1) {
                    if(layer instanceof anol.layer.DynamicGeoJSON) {
                        if(feature.get('__layer__') === layer.name) {
                            resultLayer = layer;
                        }
                    } else {
                        resultLayer = layer;
                    }
                }
            });
            return resultLayer;
        };

        ClusterSelect.prototype.getControl = function(recreate) {
            var self = this;

            if(angular.isDefined(self.selectClusterControl) && recreate !== true) {
                return self.selectClusterControl;
            }

            var interactionOptions = $.extend({}, defaultClusterOptions, this.clusterSelectOptions, {
                layers: function(layer) {
                    var anolLayer = layer.get('anolLayer');
                    if(anolLayer === undefined || !anolLayer.isClustered()) {
                        return false;
                    }
                    return self.clusterLayers.indexOf(anolLayer) > -1;
                },
                // for each revealed feature of selected cluster, this function is called
                featureStyle: function(revealedFeature, resolution) {
                    var style = new ol.style.Style();
                    // style link lines
                    if(revealedFeature.get('selectclusterlink') === true) {
                        style = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: '#f00',
                                width: 1
                            })
                        });
                    }
                    if(revealedFeature.get('selectclusterfeature') === true) {
                        var originalFeature = revealedFeature.get('features')[0];
                        var layer = self.layerByFeature(originalFeature);
                        var layerStyle = layer.olLayer.getStyle();

                        if(angular.isFunction(layerStyle)) {
                            layerStyle = layerStyle(originalFeature, resolution)[0];
                        }

                        style = layerStyle;
                    }

                    return [style];
                },
                style: function(clusterFeature, resolution) {
                    if(clusterFeature.get('features').length === 1) {
                        var layer = self.layerByFeature(clusterFeature.get('features')[0]);
                        var style = layer.olLayer.getStyle();
                        if(angular.isFunction(style)) {
                            style = style(clusterFeature, resolution);
                        }
                        if(angular.isArray(style)) {
                            return style;
                        }
                        return [style];
                    }
                    return [new ol.style.Style()];
                }
            });

            var selectedCluster;
            self.selectClusterInteraction = new ol.interaction.SelectCluster(interactionOptions);

            var changeCursorCondition = function(pixel) {
                return MapService.getMap().hasFeatureAtPixel(pixel, function(layer) {
                    var found = false;
                    if(self.selectClusterInteraction.overlayLayer_ === layer) {
                        MapService.getMap().forEachFeatureAtPixel(pixel, function(feature) {
                            if(found) {
                                return;
                            }
                            if(feature.get('selectclusterfeature')) {
                                found = true;
                            }
                        });
                    }
                    return found;
                });
            };

            MapService.addCursorPointerCondition(changeCursorCondition);

            self.selectClusterInteraction.on('select', function(a) {
                if(a.selected.length === 1) {
                    var revealedFeature = a.selected[0];
                    var zoom = MapService.getMap().getView().getZoom();
                    if(revealedFeature.get('features').length > 1 && zoom < interactionOptions.maxZoomLevel) {
                        // zoom in when not all revealed features displayed and max zoom is not reached 
                        var _featureExtent = ol.extent.createEmpty();
                        angular.forEach(revealedFeature.get('features'), function(child) {
                            var _childExtent = child.getGeometry().getExtent();
                            ol.extent.extend(_featureExtent, _childExtent)
                        });
                        var view = MapService.getMap().getView();
                        view.fit(_featureExtent, MapService.getMap().getSize()); 
                        return;
                    }
                    if(revealedFeature.get('selectclusterfeature') === true) {
                        // revealedFeature selected. execute callbacks
                        var originalFeature = revealedFeature.get('features')[0];
                        var layer = self.layerByFeature(originalFeature);
                        angular.forEach(self.selectRevealedFeatureCallbacks, function(f) {
                            f(revealedFeature, originalFeature, layer);
                        });
                        return;
                    }
                    if(revealedFeature.get('features').length > 1) {
                        // cluster with multiple features selected. cluster open
                        if(selectedCluster !== undefined) {
                            selectedCluster.setStyle(null);
                        }
                        selectedCluster = revealedFeature;
                        selectedCluster.setStyle(new ol.style.Style());
                        MapService.addCursorPointerCondition(changeCursorCondition);
                        return;
                    }
                    if(revealedFeature.get('features').length === 1) {
                        // cluster with one feature selected. clear selectedCluster style
                        if(selectedCluster !== undefined) {
                            selectedCluster.setStyle(null);
                            selectedCluster = undefined;
                        }
                    }
                } else if(a.selected.length === 0 && angular.isDefined(selectedCluster)) {
                    // cluster closed
                    selectedCluster.setStyle(null);
                    selectedCluster = undefined;
                    MapService.removeCursorPointerCondition(changeCursorCondition);
                }
            });

            self.selectClusterInteraction.getFeatures().on('add', function(e) {
                var features = e.element.get('features');
                var layer = self.layerByFeature(features[0]);
                if(angular.isFunction(layer.clusterOptions.onSelect)) {
                    layer.clusterOptions.onSelect(features);
                }
            });

            MapService.getMap().addInteraction(self.selectClusterInteraction);

            self.selectClusterControl = new anol.control.Control({
                subordinate: true,
                olControl: null,
                interactions: [self.selectClusterInteraction]
            });


            self.selectClusterControl.onDeactivate(function() {
                self.selectClusterInteraction.setActive(false);
                MapService.removeCursorPointerCondition(changeCursorCondition);
            });

            // control active by default
            MapService.addCursorPointerCondition(changeCursorCondition);

            return this.selectClusterControl;
        };
        _clusterServiceInstance = new ClusterSelect(_clusterSelectOptions, _clusterLayers);
        return _clusterServiceInstance;
    }];
}]);;
angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.ControlsServiceProvider
 */
.provider('ControlsService', [function() {
    var _controls;

    /**
     * @ngdoc method
     * @name setControls
     * @methodOf anol.map.ControlsServiceProvider
     * @param {Array.<Object>} controls ol3 controls
     */
    this.setControls = function(controls) {
        _controls = controls;
    };

    this.$get = ['ClusterSelectService', 'MapService', function(ClusterSelectService) {
        /**
         * @ngdoc service
         * @name anol.map.ControlsService
         *
         * @description
         * Stores ol3 controls and add them to map, if map present
         */
        var Controls = function(controls) {
            var self = this;
            self.olControls = [];
            self.controls = [];
            self.exclusiveControls = [];
            self.subordinateControls = [];
            self.map = undefined;
            if(controls === undefined) {
                // Zoom-, Rotate and AttributionControls provided by corresponding directives
                var defaultControls = ol.control.defaults({
                    attribution: false,
                    zoom: false,
                    rotate: false
                });
                angular.forEach(defaultControls, function(olControl) {
                    self.olControls.push(olControl);
                    self.controls.push(new anol.control.Control({
                        olControl: olControl,
                        active: true
                    }));
                });
            }
            self.addControls(controls);
        };
        /**
         * @ngdoc method
         * @name registerMap
         * @methodOf anol.map.ControlsService
         * @param {Object} map ol3 map
         * @description
         * Register an ol3 map in `ControlsService`
         */
        Controls.prototype.registerMap = function(map) {
            var self = this;
            self.map = map;

            // get cluster select control from service. undefined when no clustered layer present
            var selectClusterControl = ClusterSelectService.getControl();
            if(selectClusterControl !== undefined) {
                self.addControl(selectClusterControl);
            }

            angular.forEach(self.olControls, function(control) {
                self.map.addControl(control);
            });
        };
        /**
         * @ngdoc method
         * @name addControl
         * @methodOf anol.map.ControlsService
         * @param {Object} control ol3 control
         * @description
         * Adds a single control
         */
        Controls.prototype.addControl = function(control) {
            if(this.map !== undefined && control.olControl instanceof ol.control.Control) {
                this.map.addControl(control.olControl);
            }
            this.controls.push(control);
            if(control.olControl instanceof ol.control.Control) {
                this.olControls.push(control.olControl);
            }
            if(control.exclusive === true) {
                control.onActivate(Controls.prototype.handleExclusiveControlActivate, this);
                this.exclusiveControls.push(control);
            }
            if(control.subordinate === true) {
                this.subordinateControls.push(control);
            }
        };
        /**
         * @ngdoc method
         * @name addControls
         * @methodOf anol.map.ControlsService
         * @param {Array.<Object>} controls ol3 controls
         * @description
         * Adds an array of controls
         */
        Controls.prototype.addControls = function(controls) {
            var self = this;
            angular.forEach(controls, function(control) {
                self.addControl(control);
            });
        };
        /**
         * @ngdoc method
         * @name removeControl
         * @methodOf anol.map.ControlsService
         * @param {Object} control ol3 control
         * @description
         * Remove a single control
         */
        Controls.prototype.removeControl = function(control) {
            var controlIdx = $.inArray(this.controls, control);
            var exclusiveIdx = $.inArray(this.exclusiveControls, control);
            var subordinateIdx = $.inArray(this.subordinateControls, control);
            if(controlIdx > -1) {
                this.controls.splice(controlIdx, 1);
            }
            if(exclusiveIdx > -1) {
                this.exclusiveControls.splice(exclusiveIdx, 1);
            }
            if(subordinateIdx > -1) {
                this.subordinateControls.splice(subordinateIdx, 1);
            }
            if(this.map !== undefined && control.olControl instanceof ol.control.Control) {
                this.map.removeControl(control.olControl);
            }
        };
        /**
         * private function
         *
         * handler called on exclusiv control activate
         */
        Controls.prototype.handleExclusiveControlActivate = function(targetControl, context) {
            var self = context;
            angular.forEach(self.exclusiveControls, function(control) {
                if(control.active === true) {
                    if(control !== targetControl) {
                        control.deactivate();
                    }
                }
            });
            angular.forEach(self.subordinateControls, function(control) {
                if(control.active === true) {
                    control.deactivate();
                }
            });
            targetControl.oneDeactivate(Controls.prototype.handleExclusiveControlDeactivate, self);
        };
        /**
         * private function
         *
         * handler called on exclusiv control deactivate
         */
        Controls.prototype.handleExclusiveControlDeactivate = function(targetControl, context) {
            var self = context;
            angular.forEach(self.subordinateControls, function(control) {
                control.activate();
            });
        };
        return new Controls(_controls);
    }];
}]);
;
angular.module('anol.map')

/**
 * @ngdoc object
 * @name anol.map.InteractionsServiceProvider
 */
.provider('InteractionsService', [function() {
    var _interactions;

    /**
     * @ngdoc method
     * @name setInteractions
     * @methodOf anol.map.InteractionsServiceProvider
     * @param {Array.<Object>} interactions ol3 interactions
     */
    this.setInteractions = function(interactions) {
        _interactions = interactions;
    };

    this.$get = [function() {
        /**
         * @ngdoc service
         * @name anol.map.InteractionsService
         *
         * @description
         * Stores ol3 interactions and add them to map, if map present
         */
        var Interactions = function(interactions) {
            this.map = undefined;

            if(interactions !== undefined) {
                this.interactions = interactions;
                return;

            }
            this.interactions = ol.interaction.defaults();
        };
        /**
         * @ngdoc method
         * @name registerMap
         * @methodOf anol.map.InteractionsService
         * @param {Object} map ol3 map object
         * @description
         * Registers an ol3 map in `InteractionsService`
         */
        Interactions.prototype.registerMap = function(map) {
            var self = this;
            self.map = map;
            angular.forEach(self.interactions, function(interaction) {
                self.map.addInteraction(interaction);
            });
        };
        /**
         * @ngdoc method
         * @name addInteraction
         * @methodOf anol.map.InteractionsService
         * @param {Object} interaction ol3 interaction
         * @description
         * Adds an ol3 interaction
         */
        Interactions.prototype.addInteraction = function(interaction) {
            if(this.map !== undefined) {
                this.map.addInteraction(interaction);
            }
            this.interactions.push(interaction);
        };
        /**
         * @ngdoc method
         * @name addInteractions
         * @methodOf anol.map.InteractionsService
         * @param {Array.<Object>} interactions ol3 interactions
         * @description
         * Adds an ol3 interactions
         */
        Interactions.prototype.addInteractions = function(interactions) {
            var self = this;
            if(this.map !== undefined) {
                angular.forEach(interactions, function(interaction) {
                    self.map.addInteraction(interaction);
                });
            }
            this.interactions = this.interactions.concat(interactions);
        };
        /**
         * @ngdoc method
         * @name removeInteraction
         * @methodOf anol.map.InteractionsService
         * @param {Object} interaction ol3 interaction object to remove
         * @description
         * Removes given ol3 interaction
         */
        Interactions.prototype.removeInteraction = function(interaction) {
            this.map.removeInteraction(interaction);
            var idx = $.inArray(this.interactions, interaction);
            if(idx !== -1) {
                this.interactions.splice(idx, 1);
            }
        };
        return new Interactions(_interactions);
    }];
}]);
;
angular.module('anol.map')

/**
 * @ngdoc directive
 * @name anol.map.directive:anolMap
 *
 * @requires $timeout
 * @requires anol.DefaultMapName
 * @requires anol.map.MapService
 *
 * @description
 * The anol-map directive adds the map defined in MapService to the dom.
 *
 * It also add the DefaultMapName as id and class to the map element.
 */
.directive('anolMap', ['$timeout', 'DefaultMapName', 'MapService', 'LayersService', 'ControlsService', 'InteractionsService',
    function($timeout, DefaultMapName, MapService, LayersService, ControlsService, InteractionsService) {
    return {
        scope: {},
        link: {
            pre: function(scope, element, attrs) {
                scope.mapName = DefaultMapName;
                scope.map = MapService.getMap();
                element
                    .attr('id', scope.mapName)
                    .addClass(scope.mapName);

                scope.map.setTarget(document.getElementById(scope.mapName));
                // when twoFingePinchDrag is true and we have a touch device
                // set touchAction to it's default value.
                // This may cause page zoom on IE >= 10 browsers but allows us
                // to scroll the page when only one finger has touched and dragged the map
                if(ol.has.TOUCH && MapService.twoFingersPinchDrag) {
                    var viewport = scope.map.getViewport();
                    viewport.style.touchAction = 'auto';
                    viewport.style.msTouchAction = 'auto';
                }
            },
            post: function(scope, element, attrs) {
                $timeout(function() {
                    scope.map.updateSize();
                    // add layers after map has correct size to prevent
                    // loading layer twice (before and after resize)
                    LayersService.registerMap(scope.map);
                    ControlsService.registerMap(scope.map);

                    // add interactions from InteractionsService to map
                    angular.forEach(InteractionsService.interactions, function(interaction) {
                        if(ol.has.TOUCH && MapService.twoFingersPinchDrag) {
                            // when twoFingerPinchDrag is true, no PinchRotate interaction
                            // is added. This should improve map handling for users in twoFingerPinchDrag-mode
                            if(interaction instanceof ol.interaction.PinchRotate) {
                                interaction.setActive(false);
                                return;
                            }
                            // Skipped because a DragPan interaction is added later
                            if(interaction instanceof ol.interaction.DragPan) {
                                interaction.setActive(false);
                                return;
                            }
                            // reanable when needed
                            // if(interaction instanceof ol.interaction.PinchZoom) {
                            //     interaction.setActive(false);
                            //     return;
                            // }
                        }
                        scope.map.addInteraction(interaction);
                    });

                    InteractionsService.registerMap(scope.map);

                    if(ol.has.TOUCH && MapService.twoFingersPinchDrag === true) {
                        var useKeyControl, dragPan;
                        var pointers = 0;

                        var viewport = angular.element(scope.map.getViewport());

                        var createOverlayControl = function() {
                            var element = document.createElement('div');
                            element.className = 'map-info-overlay';
                            element.innerHTML = '<div class="map-info-overlay-text">' + MapService.twoFingersPinchDragText + '</div>';
                            var control = new ol.control.Control({
                                element: element
                            });
                            return control;
                        };

                        var handleTouchMove = function(e) {
                            if(useKeyControl === undefined) {
                                useKeyControl = createOverlayControl();
                                scope.map.addControl(useKeyControl);
                            }
                        };

                        var handleTouchStart = function(e) {
                            pointers++;
                            if(pointers > 1) {
                                if(dragPan === undefined) {
                                    dragPan = new ol.interaction.DragPan();
                                    scope.map.addInteraction(dragPan);
                                }
                                viewport.off('touchmove', handleTouchMove);
                                if(useKeyControl !== undefined) {
                                    scope.map.removeControl(useKeyControl);
                                    useKeyControl = undefined;
                                }
                                e.preventDefault();
                            } else {
                                viewport.one('touchmove', handleTouchMove);
                            }
                            if(pointers < 2) {
                                e.stopPropagation();
                            }
                        };

                        var handleTouchEnd = function(e) {
                            pointers--;
                            pointers = Math.max(0, pointers);
                            if(pointers <= 1 && useKeyControl !== undefined) {
                                scope.map.removeControl(useKeyControl);
                                useKeyControl = undefined;
                            }
                            if(pointers === 0) {
                                scope.map.removeInteraction(dragPan);
                                dragPan = new ol.interaction.DragPan();
                                scope.map.addInteraction(dragPan);
                            }
                        };

                        dragPan = new ol.interaction.DragPan();
                        scope.map.addInteraction(dragPan);

                        viewport.on('touchstart', handleTouchStart);
                        viewport.on('touchend', handleTouchEnd);
                    }
                });
            }
        },
        controller: function($scope, $element, $attrs) {
            this.getMap = function() {
                return $scope.map;
            };
        }
    };
}]);
;
angular.module('anol.attribution')

/**
 * @ngdoc filter
 * @name anol.attribution.filter:uniqueActiveAttribution
 *
 * @description
 * Reduce given layers to visible once with, removes layers with duplicated attribution
 */
.filter('uniqueActiveAttribution', function() {
    return function(layers) {
        var founds = {};
        var newLayers = [];
        angular.forEach(layers, function(layer) {
            if(!layer.getVisible()) {
                return;
            }
            if(layer.attribution === undefined || layer.attribution === null) {
                return;
            }
            if(founds[layer.attribution] === true) {
                return;
            }
            founds[layer.attribution] = true;
            newLayers.push(layer);
        });
        return newLayers;
    };
})
/**
 * @ngdoc directive
 * @name anol.attribution.directive:anolAttribution
 *
 * @requires $compile
 * @requires anol.map.ControlsService
 *
 * @param {boolean} anolAttribution Start with open attributions. Default false.
 * @param {string} attributionTooltipPlacement Tooltip position for attribution in button
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip. Default 500ms
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Provides attribution buttons
 */
.directive('anolAttribution', ['ControlsService', 'LayersService',
    function(ControlsService, LayersService) {
    return {
        restrict: 'A',
        scope: {
            attributionVisible: '@anolAttribution',
            tooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/attribution/templates/attribution.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            // attribute defaults
            scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                scope.tooltipPlacement : 'left';
            scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                scope.tooltipDelay : 500;
            scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                scope.tooltipEnable : !ol.has.TOUCH;
            scope.layers = LayersService.flattedLayers();

            ControlsService.addControl(
                new anol.control.Control({
                    element: element
                })
            );
        }
    };
}]);
;
angular.module('anol.catalog')
/**
 * @ngdoc directive
 * @name anol.catalog.anolCatalog
 *
 * @description
 * Provides a catalog of layers that can be added to map
 */
.directive('anolCatalog', ['LayersService', 'CatalogService',
    function(LayersService, CatalogService) {
    return {
        restrict: 'A',
        scope: {},
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/catalog/templates/catalog.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            scope.layers = CatalogService.catalogLayers;

            scope.addedLayers = CatalogService.addedLayers;

            scope.addToMap = function(layer) {
                CatalogService.addToMap(layer.name);
            };
            scope.removeFromMap = function(layer) {
                CatalogService.removeFromMap(layer);
            };
            scope.toggleLayerVisible = function(layer) {
                if(layer !== undefined) {
                    layer.setVisible(!layer.getVisible());
                }
            };
        }
    };
}]);
;
angular.module('anol.catalog')

/**
 * @ngdoc object
 * @name anol.catalog.CatalogServiceProvider
 */
.provider('CatalogService', [function() {
    var _catalogLayers = [];

    this.setLayers = function(layers) {
        _catalogLayers = layers;
    };

    this.$get = ['LayersService', function(LayersService) {
        /**
         * @ngdoc service
         * @name anol.catalog.CatalogService
         *
         * @description
         * Handles current catalog layer
         */
        var CatalogService = function(catalogLayers) {
            var self = this;
            this.catalogLayers = [];
            this.addedLayers = [];
            angular.forEach(catalogLayers, function(layer) {
                self.addCatalogLayer(layer);
            });
        };
        /**
         * @ngdoc method
         * @name addLayer
         * @methodOf anol.catalog.CatalogService
         * @param {Object} layer anolLayer
         * @description
         * Adds a layer to catalog
         */
        CatalogService.prototype.addCatalogLayer = function(layer) {
            this.catalogLayers.push(layer);
        };
        /**
         * @ngdoc method
         * @name addToMap
         * @methodOf anol.catalog.CatalogService
         * @param {Object} layer anolLayer
         * @description
         * Adds a catalog layer to map
         */
        CatalogService.prototype.addToMap = function(layer) {
            if(this.catalogLayers.indexOf(layer) > -1 && this.addedLayers.indexOf(layer) === -1) {
                var added = LayersService.addOverlayLayer(layer);
                if(layer instanceof anol.layer.DynamicGeoJSON && added === true) {
                    layer.refresh();
                }
                this.addedLayers.push(layer);
            }
        };
        /**
         * @ngdoc method
         * @name removeFromMap
         * @methodOf anol.catalog.CatalogService
         * @param {Object} layer anolLayer
         * @description
         * Removes a catalog layer from map
         */
        CatalogService.prototype.removeFromMap = function(layer) {
            var layerIdx = this.addedLayers.indexOf(layer);
            if(this.catalogLayers.indexOf(layer) > -1 &&  layerIdx > -1) {
                LayersService.removeOverlayLayer(layer);
                this.addedLayers.splice(layerIdx, 1);
            }
        };
        return new CatalogService(_catalogLayers);
    }];
}]);;
angular.module('anol.draw')
/**
 * @ngdoc directive
 * @name anol.draw.anolDraw
 *
 * @requires $compile
 * @requires $rootScope
 * @requires $translate
 * @requires anol.map.MapService
 * @requires anol.map.ControlsSerivce
 * @requries anol.map.DrawService
 *
 * @param {boolean} continueDrawing Don't deactivate drawing after feature is added
 * @param {function} postDrawAction Action to call after feature is drawn. Draw control will be deactivated when postDrawAction defined.
 * @param {boolean} freeDrawing Deactivate snapped drawing
 * @param {string} pointTooltipPlacement Position of point tooltip
 * @param {string} lineTooltipPlacement Position of line tooltip
 * @param {string} polygonTooltipPlacement Position of polygon tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Provides controls to draw points, lines and polygons, modify and remove them
 */
.directive('anolDraw', ['$compile', '$rootScope', '$translate', '$timeout', 'ControlsService', 'MapService', 'DrawService',
    function($compile, $rootScope, $translate, $timeout, ControlsService, MapService, DrawService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {
            continueDrawing: '@',
            postDrawAction: '&',
            freeDrawing: '@',
            tooltipDelay: '@',
            tooltipEnable: '@',
            pointTooltipPlacement: '@',
            lineTooltipPlacement: '@',
            polygonTooltipPlacement: '@'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/draw/templates/draw.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs, AnolMapController) {
            // attribute defaults
            scope.continueDrawing = angular.isDefined(scope.continueDrawing) ?
                scope.continueDrawing : false;
            scope.freeDrawing = angular.isDefined(scope.freeDrawing) ?
                scope.freeDrawing : false;
            scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                scope.tooltipEnable : !ol.has.TOUCH;
            scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                scope.tooltipDelay : 500;
            scope.pointTooltipPlacement = angular.isDefined(scope.pointTooltipPlacement) ?
                scope.pointTooltipPlacement : 'right';
            scope.lineTooltipPlacement = angular.isDefined(scope.lineTooltipPlacement) ?
                scope.lineTooltipPlacement : 'right';
            scope.polygonTooltipPlacement = angular.isDefined(scope.polygonTooltipPlacement) ?
                scope.polygonTooltipPlacement : 'right';

            scope.activeLayer = undefined;
            scope.modifyActive = false;
            var selectedFeature;
            var controls = [];
            var drawPointControl, drawLineControl, drawPolygonControl, modifyControl;

            // disabled by default. Will be enabled, when feature selected
            var removeButtonElement = element.find('.draw-remove');
            removeButtonElement.addClass('disabled');

            var executePostDrawCallback = function(evt) {
                scope.postDrawAction()(scope.activeLayer, evt.feature);
            };

            var createDrawInteractions = function(drawType, source, control, layer, postDrawActions) {
                postDrawActions = postDrawActions || [];
                // create draw interaction
                var draw = new ol.interaction.Draw({
                    source: source,
                    type: drawType
                });

                if(angular.isFunction(scope.postDrawAction) && angular.isFunction(scope.postDrawAction())) {
                    postDrawActions.push(executePostDrawCallback);
                }

                // TODO remove when https://github.com/openlayers/ol3/issues/3610/ resolved
                postDrawActions.push(function() {
                    MapService.getMap().getInteractions().forEach(function(interaction) {
                        if(interaction instanceof ol.interaction.DoubleClickZoom) {
                            interaction.setActive(false);
                            $timeout(function() {
                                interaction.setActive(true);
                            }, 275);
                        }
                    });
                });
                if(scope.continueDrawing === false && control !== undefined) {
                    postDrawActions.push(function() {
                        control.deactivate();
                    });
                }

                // bind post draw actions
                angular.forEach(postDrawActions, function(postDrawAction) {
                    draw.on('drawend', postDrawAction);
                });

                var interactions = [draw];
                if(scope.freeDrawing !== false) {
                    var snapInteraction = new ol.interaction.Snap({
                        source: layer.getSource()
                    });
                    interactions.push(snapInteraction);
                }
                return interactions;
            };

            var createModifyInteractions = function(layer) {
                var selectInteraction = new ol.interaction.Select({
                    toggleCondition: ol.events.condition.never,
                    layers: [layer]
                });
                selectInteraction.on('select', function(evt) {
                    if(evt.selected.length === 0) {
                        selectedFeature = undefined;
                        removeButtonElement.addClass('disabled');
                    } else {
                        selectedFeature = evt.selected[0];
                        removeButtonElement.removeClass('disabled');
                    }
                });
                var modifyInteraction = new ol.interaction.Modify({
                    features: selectInteraction.getFeatures()
                });
                modifyInteraction.on('modifystart', function() {
                    MapService.removeCursorPointerCondition(changeCursorCondition);
                });
                modifyInteraction.on('modifyend', function() {
                    MapService.addCursorPointerCondition(changeCursorCondition);
                });
                var snapInteraction = new ol.interaction.Snap({
                    source: layer.getSource()
                });
                return [selectInteraction, modifyInteraction, snapInteraction];
            };

            var createDrawControl = function(controlElement, controlTarget) {
                var controlOptions = {
                    element: controlElement,
                    target: controlTarget,
                    exclusive: true,
                    disabled: true
                };
                if(AnolMapController === null) {
                    controlOptions.olControl = null;
                }
                var drawControl = new anol.control.Control(controlOptions);
                drawControl.onDeactivate(deactivate, scope);
                drawControl.onActivate(activate, scope);
                return drawControl;
            };

            var createModifyControl = function(controlElement, controlTarget) {
                var controlOptions = {
                    element: controlElement,
                    target: controlTarget,
                    exclusive: true,
                    disabled: true
                };
                if(AnolMapController === null) {
                    controlOptions.olControl = null;
                }
                var _modifyControl = new anol.control.Control(controlOptions);

                // modifyControl adds all interactions needed at activate time
                // otherwise, a feature added programmaticaly is not selectable
                // until modify control is enabled twice by user
                // reproducable with featureexchange module when uploading a geojson
                // and try to select uploaded feature for modify
                _modifyControl.onDeactivate(function(targetControl) {
                    angular.forEach(targetControl.interactions, function(interaction) {
                        interaction.setActive(false);
                        MapService.getMap().removeInteraction(interaction);
                    });
                });
                _modifyControl.onActivate(function(targetControl) {
                    targetControl.interactions = createModifyInteractions(scope.activeLayer.olLayer);
                    angular.forEach(targetControl.interactions, function(interaction) {
                        interaction.setActive(true);
                        scope.map.addInteraction(interaction);
                    });
                });
                _modifyControl.onDeactivate(function() {
                    selectedFeature = undefined;
                });
                return _modifyControl;
            };

            var deactivate = function(targetControl) {
                angular.forEach(targetControl.interactions, function(interaction) {
                    interaction.setActive(false);
                });
            };

            var activate = function(targetControl) {
                angular.forEach(targetControl.interactions, function(interaction) {
                    interaction.setActive(true);
                });
            };

            var changeCursorCondition = function(pixel) {
                return scope.map.hasFeatureAtPixel(pixel, function(layer) {
                    return layer === scope.activeLayer.olLayer;
                });
            };

            // Button binds
            scope.drawPoint = function() {
                if(drawPointControl.disabled === true) {
                    return;
                }
                if(drawPointControl.active) {
                    drawPointControl.deactivate();
                } else {
                    drawPointControl.activate();
                }
            };

            scope.drawLine = function() {
                if(drawLineControl.disabled === true) {
                    return;
                }
                if(drawLineControl.active) {
                    drawLineControl.deactivate();
                } else {
                    drawLineControl.activate();
                }
            };

            scope.drawPolygon = function() {
                if(drawPolygonControl.disabled === true) {
                    return;
                }
                if(drawPolygonControl.active) {
                    drawPolygonControl.deactivate();
                } else {
                    drawPolygonControl.activate();
                }
            };

            scope.modify = function() {
                if(modifyControl.disabled === true) {
                    return;
                }
                if(modifyControl.active) {
                    modifyControl.deactivate();
                } else {
                    modifyControl.activate();
                }
            };

            scope.remove = function() {
                if(selectedFeature !== undefined) {
                    scope.activeLayer.olLayer.getSource().removeFeature(selectedFeature);
                    modifyControl.interactions[0].getFeatures().clear();
                    selectedFeature = undefined;
                }
            };

            // extra action for a realy custumised draw experience
            scope.drawCustom = function(drawType, postDrawCallback) {
                // skip when no active layer present
                if(scope.activeLayer === undefined) {
                    return;
                }
                // deactivate other controls
                angular.forEach(controls, function(control) {
                    control.deactivate();
                });

                var olLayer = scope.activeLayer.olLayer;
                var source = olLayer.getSource();
                var customDrawControl = new anol.control.Control({
                    exclusive: true,
                    olControl: null
                });
                // stores control activate event handler unregistering informations
                var unregisters = [];
                var deregisterActiveLayerChange;
                var customInteractions;
                var removeCustomDraw = function() {
                    angular.forEach(customInteractions, function(interaction) {
                        interaction.setActive(false);
                        scope.map.removeInteraction(interaction);
                    });
                    deregisterActiveLayerChange();
                    angular.forEach(unregisters, function(unregister) {
                        unregister[0].unActivate(unregister[1]);
                    });

                    customDrawControl.deactivate();
                    ControlsService.removeControl(customDrawControl);
                };

                // call the callback function
                var postDrawAction = function(evt) {
                    postDrawCallback(scope.activeLayer, evt.feature);
                };
                // remove custom draw after draw finish
                var postDrawRemoveCustomDraw = function(evt) {
                    // TODO remove when https://github.com/openlayers/ol3/issues/3610/ resolved
                    $timeout(function() {
                        removeCustomDraw();
                    }, 275);
                };

                // third param is control we don't need for this action
                customInteractions = createDrawInteractions(drawType, source, undefined, olLayer, [postDrawAction, postDrawRemoveCustomDraw]);

                // first one is always the drawInteraction
                var customDrawInteraction = customInteractions[0];

                // remove custom draw when active layer changes
                deregisterActiveLayerChange = scope.$watch(function() {
                    return DrawService.activeLayer;
                }, function(newActiveLayer) {
                    if(newActiveLayer === scope.activeLayer && newActiveLayer !== undefined) {
                        return;
                    }
                    removeCustomDraw();
                });

                // remove custom draw when one of the other controls get active
                angular.forEach(controls, function(control) {
                    unregisters.push([control, control.oneActivate(function() {
                        removeCustomDraw();
                    })]);
                });

                // activate and add customInteractions
                angular.forEach(customInteractions, function(interaction) {
                    interaction.setActive(true);
                    scope.map.addInteraction(interaction);
                });
                ControlsService.addControl(customDrawControl);
                customDrawControl.activate();
                return removeCustomDraw;
            };

            scope.map = MapService.getMap();

            element.addClass('anol-draw');

            if(AnolMapController !== null) {
                element.addClass('ol-control');
                var drawControl = new anol.control.Control({
                    element: element
                });
                controls.push(drawControl);
            }

            drawPointControl = createDrawControl(
                element.find('.draw-point'),
                element
            );
            controls.push(drawPointControl);

            drawLineControl = createDrawControl(
                element.find('.draw-line'),
                element
            );
            controls.push(drawLineControl);

            drawPolygonControl = createDrawControl(
                element.find('.draw-polygon'),
                element
            );
            controls.push(drawPolygonControl);

            modifyControl = createModifyControl(
                element.find('.draw-modify'),
                element
            );
            modifyControl.onActivate(function() {
                MapService.addCursorPointerCondition(changeCursorCondition);
            });
            modifyControl.onDeactivate(function(control) {
                control.interactions[0].getFeatures().clear();
                removeButtonElement.addClass('disabled');
                MapService.removeCursorPointerCondition(changeCursorCondition);
            });
            controls.push(modifyControl);

            ControlsService.addControls(controls);

            var allInteractions = function() {
                return drawPointControl.interactions
                    .concat(drawLineControl.interactions)
                    .concat(drawPolygonControl.interactions)
                    .concat(modifyControl.interactions);
            };

            var visibleDewatcher;

            var bindActiveLayer = function(layer) {
                drawPointControl.interactions = createDrawInteractions(
                    'Point', layer.olLayer.getSource(), drawPointControl, layer.olLayer);
                drawPointControl.enable();
                drawLineControl.interactions = createDrawInteractions(
                    'LineString', layer.olLayer.getSource(), drawLineControl, layer.olLayer);
                drawLineControl.enable();
                drawPolygonControl.interactions = createDrawInteractions(
                    'Polygon', layer.olLayer.getSource(), drawPolygonControl, layer.olLayer);
                drawPolygonControl.enable();
                modifyControl.enable();

                angular.forEach(allInteractions(), function(interaction) {
                    interaction.setActive(false);
                    scope.map.addInteraction(interaction);
                });

                scope.activeLayer = layer;

                visibleDewatcher = scope.$watch(function() {
                    return scope.activeLayer.getVisible();
                }, function(n) {
                    if(n === false) {
                        DrawService.changeLayer(undefined);
                    }
                });
            };

            var unbindActiveLayer = function() {
                angular.forEach(allInteractions(), function(interaction) {
                    interaction.setActive(false);
                    scope.map.removeInteraction(interaction);
                });

                drawPointControl.disable();
                drawPointControl.interactions = [];
                drawLineControl.disable();
                drawLineControl.interactions = [];
                drawPolygonControl.disable();
                drawPolygonControl.interactions = [];
                modifyControl.disable();
                modifyControl.interactions = [];

                if(visibleDewatcher !== undefined) {
                    visibleDewatcher();
                }

                scope.activeLayer = undefined;
            };

            scope.$watch(function() {
                return DrawService.activeLayer;
            }, function(newActiveLayer, oldActiveLayer) {
                if(newActiveLayer === scope.activeLayer) {
                    return;
                }
                if(oldActiveLayer !== undefined) {
                    unbindActiveLayer();
                }
                if(newActiveLayer !== undefined) {
                    bindActiveLayer(newActiveLayer);
                }
            });

            scope.$watch(function() {
                return modifyControl.active;
            }, function() {
                scope.modifyActive = modifyControl.active;
            });
        }
    };
}]);
;
angular.module('anol.draw')

/**
 * @ngdoc object
 * @name anol.draw.DrawServiceProvider
 */
.provider('DrawService', ['LayersServiceProvider', function(LayersServiceProvider) {
    var _drawServiceInstance;
    var _editableLayers = [];

    LayersServiceProvider.registerAddLayerHandler(function(layer) {
        if(layer.editable !== true) {
            return;
        }
        if(_drawServiceInstance !== undefined) {
            _drawServiceInstance.addLayer(layer);
        } else {
            _editableLayers.push(layer);
        }
    });
    this.$get = [function() {
        /**
         * @ngdoc service
         * @name anol.draw.DrawService
         *
         * @description
         * Handles current draw layer
         */
        var DrawService = function(editableLayers) {
            var self = this;
            this.layers = [];
            this.activeLayer = undefined;
            angular.forEach(editableLayers, function(layer) {
                self.addLayer(layer);
            });
        };
        /**
         * @ngdoc method
         * @name addLayer
         * @methodOf anol.draw.DrawService
         * @param {Object} layer anolLayer
         * @description
         * Adds a draw layer
         */
        DrawService.prototype.addLayer = function(layer) {
            this.layers.push(layer);
        };
        /**
         * @ngdoc method
         * @name changeLayer
         * @methodOf anol.draw.drawService
         * @param {Object} layer anolLayer to draw on. undefined to deactivate drawing
         * @description
         * Sets current draw layer
         */
        DrawService.prototype.changeLayer = function(layer) {
            if(layer === undefined || this.layers.indexOf(layer) !== -1) {
                this.activeLayer = layer;
            }
        };
        return new DrawService(_editableLayers);
    }];
}]);;
angular.module('anol.featureexchange')

/**
 * @ngdoc directive
 * @name anol.featureexchange.directive:anolFeatureexchange
 *
 * @restrict A
 *
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {string} filename Name of downloaded file
 * @param {function} preDownload Function executed before download provided
 * @param {function} postUpload Function executed after file uploaded
 * @param {string} srs Coordinate system to export features in / load features from
 *
 * @description
 * Download features as geojson
 */
.directive('anolFeatureexchange', ['$translate', '$rootScope', 'MapService', function($translate, $rootScope, MapService) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            layer: '=',
            filename: '=',
            preDownload: '=',
            postUpload: '=',
            srs: '@'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featureexchange/templates/featureexchange.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            var format = new ol.format.GeoJSON();
            var fileselector = element.find('#fileselector');
            var uploadErrorElement = element.find('#upload-error');

            var showError = function(errorMessage) {
                uploadErrorElement.text(errorMessage);
                uploadErrorElement.removeClass('hide');
            };

            scope.download = function() {
                if(scope.layer instanceof anol.layer.Feature) {
                    var geojson = format.writeFeaturesObject(scope.layer.getFeatures(), {
                        featureProjection: MapService.getMap().getView().getProjection(),
                        dataProjection: scope.srs || 'EPSG:4326'
                    });
                    if(angular.isFunction(scope.preDownload)) {
                        geojson = scope.preDownload(geojson);
                    }
                    geojson = JSON.stringify(geojson);
                    // ie
                    if(angular.isFunction(window.navigator.msSaveBlob)) {
                        var blobObject = new Blob([geojson]);
                        window.navigator.msSaveBlob(blobObject, scope.filename);
                    // other
                    } else {
                        var a = $('<a>Foo</a>');
                        a.attr('href', 'data:application/vnd.geo+json;charset=utf-8,' + encodeURIComponent(geojson));
                        a.attr('download', 'features.geojson');
                        a.css('display', 'none');
                        $('body').append(a);
                        a[0].click();
                        a.remove();
                    }
                }
            };

            scope.upload = function() {
                if(scope.layer instanceof anol.layer.Feature) {
                    uploadErrorElement.addClass('hide');
                    uploadErrorElement.empty();
                    fileselector.val('');
                    fileselector[0].click();
                }
            };

            fileselector.change(function(e) {
                var files = e.target.files;
                if(files.length === 0) {
                    return;
                }
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    var featureCollection;
                    try {
                        featureCollection = JSON.parse(e.target.result);
                    } catch(err) {
                        showError(scope.errorMessages.noJsonFormat);
                        return;
                    }
                    if(angular.isUndefined(featureCollection.features) || !angular.isArray(featureCollection.features)) {
                        showError(scope.errorMessages.invalidGeoJson);
                        return;
                    }
                    if(featureCollection.features.length === 0) {
                        showError(scope.errorMessages.emptyGeoJson);
                        return;
                    }
                    if(angular.isFunction(scope.postUpload)) {
                        featureCollection = scope.postUpload(featureCollection);
                    }
                    var features = format.readFeatures(featureCollection, {
                        featureProjection: MapService.getMap().getView().getProjection(),
                        dataProjection: scope.srs || 'EPSG:4326'
                    });
                    scope.layer.clear();
                    scope.layer.addFeatures(features);
                };
                fileReader.onerror = function(e) {
                    showError(scope.errorMessages.couldNotReadFile);
                };
                fileReader.readAsText(files[0]);
            });

            var translate = function() {
                $translate([
                    'anol.featureexchange.NO_JSON_FORMAT',
                    'anol.featureexchange.INVALID_GEOJSON',
                    'anol.featureexchange.EMPTY_GEOJSON',
                    'anol.featureexchange.COULD_NOT_READ_FILE'
                ]).then(function(translations) {
                    scope.errorMessages = {
                        noJsonFormat: translations['anol.featureexchange.NO_JSON_FORMAT'],
                        invalidGeoJson: translations['anol.featureexchange.INVALID_GEOJSON'],
                        emptyGeoJson: translations['anol.featureexchange.EMPTY_GEOJSON'],
                        couldNotReadFile: translations['anol.featureexchange.COULD_NOT_READ_FILE']
                    };
                });
            };
            $rootScope.$on('$translateChangeSuccess', translate);
            translate();
        }
    };
}]);;
// TODO rename to popup
angular.module('anol.featurepopup')
/**
 * @ngdoc directive
 * @name anol.featurepopup.directive:anolDragPopup
 *
 * @restrict A
 *
 * @description
 * A dragable popup
 */
.directive('anolDragPopup', ['ControlsService', 'PopupsService', function(ControlsService, PopupsService) {
    return {
        restrict: 'A',
        scope: {},
        replace: true,
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featurepopup/templates/dragpopup.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            element.css('display', 'none');
            scope.feature = undefined;
            scope.layer = undefined;
            scope.selects = {};

            var startX = 0;
            var startY = 0;
            var x = 0;
            var y = 0;

            var mouseMoveHandler = function(event) {
                x = event.screenX - startX;
                y = event.screenY - startY;
                element
                    .css('left', x)
                    .css('top', y);
            };

            var stopTrackPosition = function() {
                $(document).off('mouseup', stopTrackPosition);
                $(document).off('mousemove', mouseMoveHandler);
            };

            scope.makeControl = function(options) {
                scope.control = new anol.control.Control({
                    subordinate: false,
                    olControl: new ol.control.Control({
                        element: element[0]
                    })
                });
                if(options.selects !== undefined && !angular.equals({}, options.selects)) {
                    scope.selects = options.selects;
                }
                if(options.feature !== undefined) {
                    scope.feature = options.feature;
                }
                scope.layer = options.layer;

                element
                    .css('left', options.screenPosition[0])
                    .css('top', options.screenPosition[1])
                    .css('display', 'block');
                ControlsService.addControl(scope.control);
                element.parent().addClass('anol-popup-container');
                x = options.screenPosition[0];
                y = options.screenPosition[1];
                scope.startTrackPosition(options.event);
            };

            scope.$watchCollection(function() {
                return PopupsService.dragPopupOptions;
            }, function(n) {
                if(n.length > 0) {
                    var dragPopupOptions = n.pop();
                    scope.makeControl(dragPopupOptions);
                }
            });
            scope.close = function() {
                ControlsService.removeControl(scope.control);
            };

            scope.startTrackPosition = function(event) {
                startX = event.screenX - x;
                startY = event.screenY - y;
                $(document).on('mousemove', mouseMoveHandler);
                $(document).on('mouseup', stopTrackPosition);
            };
        }
    };
}]);
;
// TODO rename to popup
angular.module('anol.featurepopup')
/**
 * @ngdoc directive
 * @name anol.featurepopup.directive:anolFeaturePopup
 *
 * @restrict A
 *
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {anol.layer.Feature} layers Layers to show popup for
 * @param {number} tolerance Click tolerance in pixel
 * @param {object} openFor Accepts an object with layer and feature property. If changed, a popup is shown for given value
 * @param {string} openingDirection Direction where the popup open. Default is top. Also the values left, bottom and right are possible
 * @param {number} autoPanMargin Popup margin to map border for auto pan
 *
 * @description
 * Shows a popup for selected feature
 */
.directive('anolFeaturePopup', ['$window', '$timeout', 'MapService', 'LayersService', 'ControlsService', 'PopupsService', function($window, $timeout, MapService, LayersService, ControlsService, PopupsService) {
    // TODO use for all css values
    var cssToFloat = function(v) {
        return parseFloat(v.replace(/[^-\d\.]/g, ''));
    };

    return {
        restrict: 'A',
        scope: {
            'layers': '=?',
            'excludeLayers': '=?',
            'tolerance': '=?',
            'openFor': '=?',
            'openingDirection': '@',
            'onClose': '&?',
            'coordinate': '=?',
            'offset': '=?',
            '_autoPanMargin': '=autoPanMargin',
            '_popupFlagSize': '=popupFlagSize',
            '_mobileFullscreen': '=mobileFullscreen',
            '_autoPanOnSizeChange': '=autoPanOnSizeChange',
            '_allowDrag': '=allowDrag'
        },
        replace: true,
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featurepopup/templates/popup.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            var self = this;
            PopupsService.register(scope);
            var multiselect = angular.isDefined(attrs.multiselect);
            var clickPointSelect = angular.isDefined(attrs.clickPointSelect);
            scope.sticky = angular.isDefined(attrs.sticky);
            scope.openingDirection = scope.openingDirection || 'top';
            scope.map = MapService.getMap();

            scope.feature = undefined;
            scope.layer = undefined;
            scope.selects = {};

            scope.autoPanMargin = angular.isDefined(scope._autoPanMargin) ? scope._autoPanMargin : 20;
            scope.popupFlagSize = angular.isDefined(scope._popupFlagSize) ? scope._popupFlagSize : 15;
            scope.mobileFullscreen = angular.isDefined(scope._mobileFullscreen) ? scope._mobileFullscreen : false;
            scope.autoPanOnSizeChange = angular.isDefined(scope._autoPanOnSizeChange) ? scope._autoPanOnSizeChange : false;
            scope.allowDrag = angular.isDefined(scope._allowDrag) ? scope._allowDrag : false;
            if(angular.isUndefined(scope.layers)) {
                scope.layers = [];
                scope.$watchCollection(function() {
                    return LayersService.flattedLayers();
                }, function(layers) {
                    scope.layers.length = 0;
                    angular.forEach(layers, function(layer) {
                        if(!(layer instanceof anol.layer.Feature)) {
                            return;
                        }
                        if(angular.isDefined(scope.excludeLayers) && scope.excludeLayers.indexOf(layer) > -1) {
                            return;
                        }
                        scope.layers.push(layer);
                    });
                });
            }
            scope.overlayOptions = {
                element: element[0],
                autoPan: true,
                autoPanAnimation: {
                    duration: 250
                },
                autoPanMargin: scope.autoPanMargin
            };

            if(scope.coordinate !== undefined) {
                scope.overlayOptions.position = scope.coordinate;
            }
            if(scope.offset !== undefined) {
                scope.overlayOptions.offset = scope.offset;
            }

            scope.popup = new ol.Overlay(scope.overlayOptions);
            scope.map.addOverlay(scope.popup);
            element.parent().addClass('anol-popup-container');
            if(scope.mobileFullscreen === true) {
                element.parent().addClass('mobile-fullscreen');
            }

            if(scope.sticky) {
                return;
            }

            var updateOffset = function(featureLayerList) {
                if(scope.offset !== undefined) {
                    return;
                }
                var offset = [0, 0];
                angular.forEach(featureLayerList, function(v) {
                    var feature = v[0];
                    var layer = v[1];
                    var style = feature.getStyle();
                    if(style === null) {
                        style = layer.getStyle();
                    }
                    if(angular.isFunction(style)) {
                        style = style(feature, scope.map.getView().getResolution())[0];
                    }
                    var image = style.getImage();
                    // only ol.Style.Icons (subclass of ol.Style.Image) have getSize function
                    if(image !== null && angular.isFunction(image.getSize)) {
                        var size = image.getSize();
                        switch(scope.openingDirection) {
                            case 'top':
                                offset[1] = Math.min(offset[1], size[1] / -2);
                            break;
                            case 'bottom':
                                offset[1] = Math.min(offset[1], size[1] / 2);
                            break;
                            case 'left':
                                offset[0] = Math.min(offset[0], size[0] / -2);
                            break;
                            case 'right':
                                offset[0] = Math.min(offset[0], size[0] / 2);
                            break;
                        }

                    }
                });
                scope.popup.setOffset(offset);
            };

            var handleClick = function(evt) {
                var extent = [
                    evt.coordinate[0] - (scope.tolerance || 0),
                    evt.coordinate[1] - (scope.tolerance || 0),
                    evt.coordinate[0] + (scope.tolerance || 0),
                    evt.coordinate[1] + (scope.tolerance || 0)
                ];

                var found = false;
                var features = [];
                var singleFeature, singleLayer;

                if(clickPointSelect) {
                    angular.forEach(scope.layers, function(layer) {
                        if(!layer.getVisible()) {
                            return;
                        }
                        var _features = layer.olLayer.getSource().getFeaturesInExtent(extent);

                        if(_features.length > 0) {
                            features = features.concat(_features);
                            found = true;
                            if(singleFeature === undefined) {
                                singleFeature = _features[0];
                                singleLayer = layer;
                            }
                            scope.selects[layer.name] = {
                                layer: layer,
                                features: _features
                            };
                        }
                    });
                    if(found === true) {
                        scope.coordinate = evt.coordinate;
                    } else {
                        scope.coordinate = undefined;
                    }
                } else {
                    if(multiselect === true) {
                        scope.selects = {};
                    } else {
                        scope.feature = undefined;
                        scope.layer = undefined;
                    }

                    found = false;
                    var featureLayerList = [];
                    scope.map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
                        if(layer === undefined || layer === null) {
                            return;
                        }

                        if(layer.getSource() instanceof ol.source.Cluster) {
                            // set to original feature when clicked on clustered feature containing one feature
                            if(feature.get('features').length === 1) {
                                feature = feature.get('features')[0];
                            } else {
                                return;
                            }
                        }

                        var anolLayer = layer.get('anolLayer');

                        if(scope.layers.indexOf(anolLayer) === -1) {
                            return;
                        }

                        if(multiselect !== true) {
                            if(scope.layer === undefined && scope.feature === undefined) {
                                scope.layer = anolLayer;
                                scope.feature = feature;
                                featureLayerList.push([feature, layer]);
                                found = true;
                            }
                            return;
                        }
                        if(scope.selects[anolLayer.name] === undefined) {
                            scope.selects[anolLayer.name] = {
                                layer: anolLayer,
                                features: []
                            };
                        }
                        scope.selects[anolLayer.name].features.push(feature);
                        featureLayerList.push([feature, layer]);
                        found = true;
                    });
                    if(found) {
                        scope.coordinate = evt.coordinate;
                    } else {
                        scope.coordinate = undefined;
                    }
                    updateOffset(featureLayerList);
                }
                scope.$digest();
            };

            var changeCursorCondition = function(pixel) {
                return scope.map.hasFeatureAtPixel(pixel, function(layer) {
                    return scope.layers.indexOf(layer.get('anolLayer')) !== -1;
                });
            };

            var bindCursorChange = function() {
                if(scope.layers === undefined || scope.layers.length === 0) {
                    MapService.removeCursorPointerCondition(changeCursorCondition);
                } else if(scope.layers !== undefined && scope.layers.length !== 0) {
                    MapService.addCursorPointerCondition(changeCursorCondition);
                }
            };

            var control = new anol.control.Control({
                subordinate: true,
                olControl: null
            });
            control.onDeactivate(function() {
                scope.map.un('singleclick', handleClick, self);
                MapService.removeCursorPointerCondition(changeCursorCondition);
            });
            control.onActivate(function() {
                scope.map.on('singleclick', handleClick, self);
                MapService.addCursorPointerCondition(changeCursorCondition);
            });

            scope.$watch('layers', function(n, o) {
                if(angular.equals(n, o)) {
                    return;
                }
                scope.coordinate = undefined;
            });

            control.activate();

            ControlsService.addControl(control);

            scope.$watch('layers', bindCursorChange);
            scope.$watch('coordinate', function(coordinate) {
                if(coordinate === undefined) {
                    scope.selects = {};
                    scope.layer = undefined;
                    scope.feature = undefined;
                    if(angular.isFunction(scope.onClose) && angular.isFunction(scope.onClose())) {
                        scope.onClose()();
                    }
                }
                else if (scope.mobileFullscreen === true && $window.innerWidth >= 480) {
                    var xPadding = parseInt(element.css('padding-left').replace(/[^-\d\.]/g, ''));
                    xPadding += parseInt(element.css('padding-right').replace(/[^-\d\.]/g, ''));
                    var yPadding = parseInt(element.css('padding-top').replace(/[^-\d\.]/g, ''));
                    yPadding += parseInt(element.css('padding-bottom').replace(/[^-\d\.]/g, ''));
                    var mapElement = $(scope.map.getTargetElement());
                    var maxWidth = mapElement.width() - (scope.autoPanMargin * 2) - xPadding;
                    var maxHeight = mapElement.height() - (scope.autoPanMargin * 2) - yPadding;
                    if(scope.openingDirection === 'top' || scope.openingDirection === 'bottom') {
                        maxHeight -= scope.popupFlagSize;
                    } else {
                        maxWidth -= scope.popupFlagSize;
                    }
                    var content = element.find('.anol-popup-content').children();
                    if(content.length > 0) {
                        var target = content.first();
                        target.css('max-width', maxWidth + 'px');
                        target.css('max-height', maxHeight + 'px');
                    }
                }
                $timeout(function() {
                    scope.popup.setPosition(coordinate);
                });
            });
            scope.$watch('openFor', function(openFor) {
                if(angular.isDefined(openFor)) {
                    scope.layer = openFor.layer;
                    scope.feature = openFor.feature;

                    if('coordinate' in openFor) {
                        scope.coordinate = openFor.coordinate;
                    } else if(scope.feature !== undefined) {
                        scope.coordinate = scope.feature.getGeometry().getLastCoordinate();
                    }

                    if(openFor.content !== undefined) {
                        element.find('.anol-popup-content').empty().append(openFor.content);
                    }
                    scope.openFor = undefined;
                }
            });

            if(scope.autoPanOnSizeChange === true) {
                scope.$watchCollection(function() {
                    return {
                        w: element.width(),
                        h: element.height()
                    };
                }, function() {
                    scope.popup.setPosition(undefined);
                    scope.popup.setPosition(scope.coordinate);
                });
            }
            scope.makeDraggable = function(event) {
                if(scope.allowDrag === false) {
                    return;
                }
                var y = cssToFloat(element.parent().css('top')) + cssToFloat(element.css('top'));
                var x = cssToFloat(element.parent().css('left')) + cssToFloat(element.css('left'));

                PopupsService.makeDraggable(scope, [x, y], scope.feature, scope.layer, scope.selects, event);
            };
        },
        controller: function($scope, $element, $attrs) {
            this.close = function() {
                if($scope.coordinate !== undefined) {
                    $scope.coordinate = undefined;
                }
            };
            $scope.close = this.close;
        }
    };
}]);
;
angular.module('anol.featurepopup')

/**
 * @ngdoc object
 * @name anol.map.PopupsServiceProvider
 */
.provider('PopupsService', [function() {
    this.$get = [function() {
        var Popups = function() {
            this.popupScopes = [];
            this.dragPopupOptions = [];
        };
        Popups.prototype.register = function(popupScope) {
            this.popupScopes.push(popupScope);
        };
        Popups.prototype.closeAll = function() {
            angular.forEach(this.popupScopes, function(popupScope) {
                popupScope.close();
            });
        };
        Popups.prototype.makeDraggable = function(popupScope, position, feature, layer, selects, event) {
            var dragPopupOptions = {
                screenPosition: position,
                feature: feature,
                layer: layer,
                selects: selects,
                event: event
            };
            popupScope.close();
            this.dragPopupOptions.push(dragPopupOptions);
        };
        return new Popups();
    }];
}]);
;
angular.module('anol.featureproperties')
/**
 * @ngdoc directive
 * @name anol.featureproperties.directive:anolFeatureProperties
 *
 * @restrict A
 * @requires pascalprecht.$translate
 *
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {ol.Feature} feature Feature to show properties for
 * @param {anol.layer.Feature} layer Layer of feature
 * @param {string} translationNamespace Namespace to use in translation table. Default "featureproperties".
 *
 * @description
 * Shows feature properties for layers with 'featureinfo' property.
 *
 * Layer property **featureinfo** - {Object} - Contains properties:
 * - **properties** {Array<String>} - Property names to display
 *
 * **Translating feature properties**
 * @example
 * ```
{
    "featureproperties": {
        "{layername}": {
            "PROPERTY_KEY": "{property key translation}",
            "property_key": {
                "property_value_1": "{property value 1 translation}",
                "property_value_2": "{property value 2 translation}"
            }
        }
    }
}```
 *
 *
 */
.directive('anolFeatureProperties', ['$translate', function($translate) {
    return {
        restrict: 'A',
        require: '?^anolFeaturePopup',
        scope: {
            'feature': '=',
            'layer': '=',
            'selects': '=',
            'translationNamespace': '@'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featureproperties/templates/featureproperties.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs, FeaturePopupController) {
            scope.translationNamespace = angular.isDefined(scope.translationNamespace) ?
                scope.translationNamespace : 'featureproperties';

            scope.propertiesCollection = [];

            var propertiesFromFeature = function(feature, layerName, displayProperties) {
                var properties = {};
                angular.forEach(feature.getProperties(), function(value, key) {
                    if(
                        angular.isDefined(value) &&
                        value !== null &&
                        $.inArray(key, displayProperties) > -1 &&
                        value.length > 0
                    ) {
                        properties[key] = {
                            key: key,
                            value: value
                        };
                        var translateKey = [scope.translationNamespace, layerName, key.toUpperCase()].join('.');
                        var translateValue = [scope.translationNamespace, layerName, key, value].join('.');
                        // this get never rejected cause of array usage
                        // see https://github.com/angular-translate/angular-translate/issues/960
                        $translate([
                            translateKey,
                            translateValue
                        ]).then(
                            function(translations) {
                                var translatedKey = translations[translateKey];
                                var translatedValue = translations[translateValue];
                                if(translatedKey === translateKey) {
                                    translatedKey = key;
                                }
                                if(translatedValue === translateValue) {
                                    translatedValue = value;
                                }
                                properties[key] = {
                                    key: translatedKey,
                                    value: translatedValue
                                };
                            }
                        );
                    }
                });
                return properties;
            };

            var featureChangeHandler = function(feature) {
                var propertiesCollection = [];
                if(scope.layer === undefined || !angular.isObject(scope.layer.featureinfo)) {
                    scope.propertiesCollection = propertiesCollection;
                } else {
                    var properties = propertiesFromFeature(feature, scope.layer.name, scope.layer.featureinfo.properties);
                    if(!angular.equals(properties, {})) {
                        propertiesCollection.push(properties);
                    }
                    scope.propertiesCollection = propertiesCollection;
                }
                if(FeaturePopupController !== null && scope.propertiesCollection.length === 0) {
                    FeaturePopupController.close();
                }
            };

            var selectsChangeHandler = function(selects) {
                var propertiesCollection = [];
                angular.forEach(selects, function(selectObj) {
                    var layer = selectObj.layer;
                    var features = selectObj.features;
                    if(!angular.isObject(layer.featureinfo) || features.length === 0) {
                        return;
                    }
                    angular.forEach(features, function(feature) {
                        var properties = propertiesFromFeature(feature, layer.name, layer.featureinfo.properties);
                        if(!angular.equals(properties, {})) {
                            propertiesCollection.push(properties);
                        }
                    });
                });
                scope.propertiesCollection = propertiesCollection;
                if(FeaturePopupController !== null && scope.propertiesCollection.length === 0) {
                    FeaturePopupController.close();
                }
            };

            scope.$watch('feature', featureChangeHandler);
            scope.$watchCollection('selects', selectsChangeHandler);
        }
    };
}])

.directive('urlOrText', [function() {
    return {
        restrict: 'E',
        scope: {
            url: '=value'
        },
        link: function(scope, element, attrs) {
            var isUrl = function(s) {
                var regexp = /(http:\/\/|https:\/\/|www\.)/;
                return regexp.test(s);
            };
            scope.$watch('url', function(url) {
                var content = url;
                if(isUrl(url)) {
                    content = $('<a href="' + url + '">' + url + '</a>');
                }
                element.html(content);
            });
        }
    };
}]);
;
angular.module('anol.featurepropertieseditor')
/**
 * @ngdoc directive
 * @name anol.featurepropertieseditor.directive:anolFeaturePropertiesEditor
 *
 * @restrict A
 *
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {ol.Feature} anolFeaturePropertiesEditor Feature to edit
 * @param {anol.layer.Feature} layer Layer of feature
 *
 * @description
 * Shows a form for editing feature properties
 */
.directive('anolFeaturePropertiesEditor', [function() {
    return {
        restrict: 'A',
        scope: {
            feature: '=anolFeaturePropertiesEditor',
            layer: '='
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featurepropertieseditor/templates/featurepropertieseditor.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs) {
            scope.properties = {};
            var propertyWatchers = {};

            // TODO move into anol.layer.Feature
            var ignoreProperty = function(key) {
                if(key === 'geometry') {
                    return true;
                }
                if(key === 'style') {
                    return true;
                }
                return false;
            };

            var registerPropertyWatcher = function(key) {
                if(ignoreProperty(key) || propertyWatchers[key] !== undefined) {
                    return;
                }
                var watcher = scope.$watch(function() {
                    return scope.properties[key];
                }, function(n) {
                    if(n === undefined) {
                        scope.feature.unset(key);
                    } else if(n !== scope.feature.get(key)) {
                        scope.feature.set(key, n);
                    }
                });
                propertyWatchers[key] = watcher;
            };

            var clearPropertyWatchers = function() {
                angular.forEach(propertyWatchers, function(dewatch) {
                    dewatch();
                });
                propertyWatchers = {};
            };

            scope.propertiesNames = function() {
                var result = [];
                angular.forEach(scope.properties, function(value, key) {
                    if(ignoreProperty(key)) {
                        return;
                    }
                    result.push(key);
                });
                return result;
            };

            scope.handleAddPropertyKeydown = function(event) {
                if(event.key === 'Enter' || event.keyCode === 13) {
                    scope.addProperty();
                }
            };

            scope.addProperty = function() {
                if(scope.newKey) {
                    scope.properties[scope.newKey] = '';
                    scope.feature.set(scope.newKey, '');
                    scope.newKey = '';
                }
            };
            scope.removeProperty = function(key) {
                delete scope.properties[key];
                scope.feature.unset(key);
            };

            scope.$watch('feature', function(feature) {
                clearPropertyWatchers();
                scope.properties = {};
                if(feature !== undefined) {
                    scope.properties = feature.getProperties();
                }
            });
            scope.$watchCollection('properties', function(properties) {
                angular.forEach(properties, function(value, key) {
                    registerPropertyWatcher(key);
                });
            });
        }
    };
}]);
;
angular.module('anol.featurestyleeditor')

.directive('color', function() {
    var COLOR_REGEX = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            ctrl.$validators.color = function(modelValue, viewValue) {
                if(ctrl.$isEmpty(modelValue)) {
                    return true;
                }
                if(ctrl.$isEmpty(viewValue)) {
                    return false;
                }
                var result =  COLOR_REGEX.test(viewValue);
                return result;
            };
        }
    };
});
;
angular.module('anol.featurestyleeditor')
/**
 * @ngdoc directive
 * @name anol.featurestyleeditor.directive:anolFeatureStyleEditor
 *
 * @restrict A
 * @requires $rootScope
 * @requires $translate
 *
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {ol.Feature} anolFeatureStyleEditor Feature to edit
 * @param {anol.layer.Feature} layer Layer feature belongs to
 * @param {boolean} formDisabled Disable style editor
 * @param {string} disabledText Text to display while styleeditor is disabled
 *
 * @description
 * Shows a form for editing feature style depending on its geometry type
 */
.directive('anolFeatureStyleEditor', ['$rootScope', '$translate', function($rootScope, $translate) {
    var prepareStyleProperties = function(_style) {
        var style = angular.copy(_style);
        if(style.radius !== undefined) {
            style.radius = parseInt(style.radius);
        }
        if(style.strokeWidth !== undefined) {
            style.strokeWidth = parseInt(style.strokeWidth);
        }
        if(style.strokeOpacity !== undefined) {
            style.strokeOpacity = parseFloat(style.strokeOpacity);
        }
        if(style.fillOpacity !== undefined) {
            style.fillOpacity = parseFloat(style.fillOpacity);
        }
        if(style.graphicRotation !== undefined) {
            style.graphicRotation = parseFloat(style.graphicRotation);
        }
        return style;
    };

    var purgeStyle = function(_style) {
        var style = {};
        angular.forEach(_style, function(value, key) {
            if(value === undefined || value === '' || value === null) {
                style[key] = undefined;
            } else {
                style[key] = value;
            }
        });
        return style;
    };

    return {
        restrict: 'A',
        scope: {
            feature: '=anolFeatureStyleEditor',
            layer: '=',
            formDisabled: '=',
            disabledText: '@'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/featurestyleeditor/templates/featurestyleeditor.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: {
            pre: function(scope, element, attrs) {
                element.addClass('anol-styleeditor');
                var unregisterStyleWatcher;
                scope.$watch('feature', function(feature) {
                    if(unregisterStyleWatcher !== undefined) {
                        unregisterStyleWatcher();
                        unregisterStyleWatcher = undefined;
                    }
                    var layerStyle = {};
                    if(scope.layer !== undefined && scope.layer.options !== undefined) {
                        layerStyle = prepareStyleProperties(scope.layer.options.style || {});
                    }

                    if(feature !== undefined) {
                        scope.style = prepareStyleProperties(
                            $.extend(true, {}, layerStyle, feature.get('style'))
                        );
                        scope.geometryType = feature.getGeometry().getType();

                        unregisterStyleWatcher = scope.$watchCollection('style', function(_newStyle, _oldStyle) {
                            var newStyle = purgeStyle(_newStyle);
                            var oldStyle = purgeStyle(_oldStyle);
                            var style = {};
                            // only add changed values
                            angular.forEach(newStyle, function(value, key) {
                                if(oldStyle[key] !== value) {
                                    style[key] = value;
                                }
                                if(layerStyle[key] === value) {
                                    style[key] = undefined;
                                }
                            });
                            var featureStyle = feature.get('style') || {};
                            var combinedStyle = angular.extend({}, featureStyle, style);
                            if(angular.equals(combinedStyle, {})) {
                                feature.unset('style');
                            } else {
                                feature.set('style', combinedStyle);
                            }
                        });
                    }
                });

                var disableOverlay;
                var addOverlay = function() {
                    disableOverlay = angular.element('<div class="anol-styleeditor-disabled-overlay"></div>');
                    if(scope.disabledText !== undefined) {
                        var disabledText = angular.element('<p class="anol-styleeditor-disabled-text">' + scope.disabledText + '</p>');
                        disableOverlay.append(disabledText);
                    }
                    element.append(disableOverlay);
                };

                var removeOverlay = function() {
                    disableOverlay.remove();
                    disableOverlay = undefined;
                };

                scope.$watch('formDisabled', function(n, o) {
                    if(o === true) {
                        removeOverlay();
                    }
                    if(n === true) {
                        addOverlay();
                    }
                });

                var translate = function() {
                    $translate([
                        'anol.featurestyleeditor.SOLID',
                        'anol.featurestyleeditor.DOT',
                        'anol.featurestyleeditor.DASH',
                        'anol.featurestyleeditor.DASHDOT',
                        'anol.featurestyleeditor.LONGDASH',
                        'anol.featurestyleeditor.LONGDASHDOT'
                    ]).then(function(translations) {
                        scope.strokeDashStyles = [
                            {value: 'solid', label: translations['anol.featurestyleeditor.SOLID']},
                            {value: 'dot', label: translations['anol.featurestyleeditor.DOT']},
                            {value: 'dash', label: translations['anol.featurestyleeditor.DASH']},
                            {value: 'dashdot', label: translations['anol.featurestyleeditor.DASHDOT']},
                            {value: 'longdash', label: translations['anol.featurestyleeditor.LONGDASH']},
                            {value: 'longdashdot', label: translations['anol.featurestyleeditor.LONGDASHDOT']}
                        ];
                    });
                };
                $rootScope.$on('$translateChangeSuccess', translate);
                translate();
            }
        }
    };
}]);
;
angular.module('anol.geocoder')
/**
 * @ngdoc directive
 * @name anol.geocoder.directive:anolGeocoderSearchbox
 *
 * @restrict A
 * @required $timeout
 * @requires anol.map.MapService
 * @requires anol.map.ControlsService
 *
 * @param {string} anolGeocoderSearchbox Name of geocoder to use. Must be an available anol.geocoder
 * @param {string} zoomLevel Level to show result in
 * @param {object} geocoderOptions Options for selected geocoder
 * @param {string} proxyUrl Proxy to use
 * @param {number} highlight Time result marker is visible. Use 0 for invinitiv visibility (removeable by click)
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Search for a location string on given geocoder, display and select results
 */
.directive('anolGeocoderSearchbox', ['$timeout', '$location', 'MapService', 'ControlsService', 'InteractionsService', 'LayersService', 'UrlMarkersService',
  function($timeout, $location, MapService, ControlsService, InteractionsService, LayersService, UrlMarkersService) {
    return {
      restrict: 'A',
      require: '?^anolMap',
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
          var defaultUrl = 'src/modules/geocoder/templates/searchbox.html';
          return tAttrs.templateUrl || defaultUrl;
      },
      scope: {
        geocoder: '@anolGeocoderSearchbox',
        zoomLevel: '@',
        geocoderOptions: '=',
        proxyUrl: '@',
        highlight: '@',
        markerStyle: '=?',
        toUrlMarker: '=?',
        urlMarkerColor: '@?',
        urlMarkerWithLabel: '@?'
      },
      link: function(scope, element, attrs, AnolMapController) {
        var removeMarkerInteraction;
        var geocoderOptions = angular.copy(scope.geocoderOptions);
        var markerLayer = new anol.layer.Feature({
          name: 'geocoderLayer',
          displayInLayerswitcher: false,
          style: scope.markerStyle
        });
        var markerOlLayerOptions = markerLayer.olLayerOptions;
        markerOlLayerOptions.source = new markerLayer.OL_SOURCE_CLASS(markerLayer.olSourceOptions);
        markerLayer.setOlLayer(new markerLayer.OL_LAYER_CLASS(markerOlLayerOptions));

        LayersService.addSystemLayer(markerLayer);

        if(angular.isDefined(scope.proxyUrl)) {
          if(scope.proxyUrl[scope.proxyUrl.length - 1] !== '/') {
            scope.proxyUrl += '/';
          }
          geocoderOptions.url = scope.proxyUrl + geocoderOptions.url;
        }

        var geocoder = new anol.geocoder[scope.geocoder](geocoderOptions);
        scope.searchResults = [];
        scope.noResults = false;
        scope.searchInProgress = false;
        scope.showResultList = false;
        scope.isScrolling = false;
        scope.highlight = angular.isDefined(scope.highlight) ? parseInt(scope.highlight) : false;
        scope.urlMarkerAdded = false;

        var changeCursorCondition = function(pixel) {
            return MapService.getMap().hasFeatureAtPixel(pixel, function(layer) {
                return markerLayer === layer.get('anolLayer');
            });
        };

        var addUrlMarker = function(coordinate, projectionCode, label) {
          if(scope.toUrlMarker !== true) {
            return;
          }
          removeUrlMarker();
          var position = ol.proj.transform(
            coordinate,
            projectionCode,
            'EPSG:4326'
          );
          var urlParams = $location.search();

          var urlMarkers = [];

          if(!angular.isUndefined(urlParams.marker)) {
            if(angular.isArray(urlParams.marker)) {
              urlMarkers = urlParams.marker;
            } else {
              urlMarkers.push(urlParams.marker);
            }
          }

          var urlMarker = {
            'color': scope.urlMarkerColor || 'aa0000',
            'coord':  position.join(','),
            'srs': '4326',
            'label': label
          };
          if(scope.urlMarkerWithLabel === 'true') {
            urlMarker.label = label;
          }
          var urlMarkerParams = [];
          angular.forEach(urlMarker, function(v, k) {
            urlMarkerParams.push(k + UrlMarkersService.keyValueDelimiter + v);
          });
          var urlMarkerString = urlMarkerParams.join(UrlMarkersService.propertiesDelimiter);
          urlMarkers.push(urlMarkerString);
          $location.search('marker', urlMarkers);
          scope.urlMarkerAdded = true;
        };

        var removeUrlMarker = function() {
          if(scope.toUrlMarker !== true) {
            return;
          }
          if(!scope.urlMarkerAdded) {
            return;
          }
          var urlParams = $location.search();
          var urlMarkers = urlParams.marker;
          if(urlMarkers.length > 0) {
            urlMarkers.pop();
          }
          $location.search('marker', urlMarkers);
          scope.urlMarkerAdded = false;
        };

        var addMarker = function(position) {
          var markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(position)
          });
          var markerSource = markerLayer.olLayer.getSource();
          markerSource.addFeature(markerFeature);
          if(scope.highlight > 0) {
            $timeout(function() {
              markerSource.clear();
            }, scope.highlight);
          } else {
            removeMarkerInteraction = new ol.interaction.Select({
              layers: [markerLayer.olLayer]
            });
            removeMarkerInteraction.on('select', function(evt) {
              if(evt.selected.length > 0) {
                removeMarkerInteraction.getFeatures().clear();
                markerSource.clear();
                InteractionsService.removeInteraction(removeMarkerInteraction);
                MapService.removeCursorPointerCondition(changeCursorCondition);
                removeMarkerInteraction = undefined;
                removeUrlMarker();
              }
            });
            InteractionsService.addInteraction(removeMarkerInteraction);
            MapService.addCursorPointerCondition(changeCursorCondition);
          }
        };

        scope.startSearch = function() {
          scope.searchResults = [];
          scope.noResults = false;
          scope.searchInProgress = true;

          markerLayer.clear();
          removeUrlMarker();

          element.find('.anol-searchbox').removeClass('open');
          geocoder.request(scope.searchString)
            .then(function(results) {
              scope.searchInProgress = false;
              if(results.length === 0) {
                scope.noResults = true;
              } else {
                scope.searchResults = results;
                element.find('.anol-searchbox').addClass('open');
              }
              scope.$digest();
            });
        };

        scope.handleInputKeypress = function(event) {
          event.stopPropagation();
          if((event.key === 'ArrowDown' || event.keyCode === 40) && scope.searchResults.length > 0) {
            event.preventDefault();
            element.find('.dropdown-menu li a:first').focus();
          }
          if(event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            scope.startSearch();
          }
          return false;
        };
        scope.handleInputFocus = function(event) {
          scope.showResultList = true;
        };
        scope.handleInputBlur = function(event) {
          scope.showResultList = false;
        };
        scope.handleResultListMousedown = function(event) {
          scope.isScrolling = true;
        };
        scope.handleResultListMouseup = function(event) {
          scope.isScrolling = false;
        };

        scope.handleResultElementKeypress = function(event) {
          event.stopPropagation();
          var targetParent = angular.element(event.currentTarget).parent();
          if(event.key === 'ArrowDown' || event.keyCode === 40) {
            event.preventDefault();
            targetParent.next().find('a').focus();
          }
          if(event.key === 'ArrowUp' || event.keyCode === 38) {
            event.preventDefault();
            var target = targetParent.prev().find('a');
            if(target.length === 0) {
              element.find('.form-control').focus();
            } else {
              target.focus();
            }
          }
          return false;
        };

        scope.handleResultElementMouseover = function(event) {
          scope.isScrolling = false;
          angular.element(event.currentTarget).focus();
        };

        scope.handleResultElementFocus = function(event) {
          scope.showResultList = true;
        };

        scope.handleResultElementBlur = function(event) {
          if(scope.isScrolling) {
            angular.element(event.currentTarget).focus();
          } else {
            scope.showResultList = false;
          }
        };



        scope.showResult = function(result) {
          var view = MapService.getMap().getView();
          var position = ol.proj.transform(
            result.coordinate,
            result.projectionCode,
            view.getProjection()
          );
          view.setCenter(position);
          if(angular.isDefined(scope.zoomLevel)) {
            view.setZoom(parseInt(scope.zoomLevel));
          }
          if(scope.highlight !== false) {
            addMarker(position);
          }

          addUrlMarker(
            result.coordinate,
            result.projectionCode,
            result.displayText
          );
          scope.searchResults = [];
          element.find('.anol-searchbox').removeClass('open');
          scope.searchString = result.displayText;
        };

        if(angular.isObject(AnolMapController)) {
           ControlsService.addControl(new anol.control.Control({
            element: element
          }));
        }
      }
    };
}]);;
angular.module('anol.geolocation')
/**
 * @ngdoc directive
 * @name anol.geolocation.directive:anolGeolocation
 *
 * @restrict A
 * @requires $compile
 * @requires anol.map.MapService
 * @requires anol.map.ControlsService
 *
 * @param {boolean} anolGeolocation When true, geolocation is startet just after map init
 * @param {boolean} disableButton When true, no geolocate button is added
 * @param {number} zoom Zoom level after map centered on geolocated point
 * @param {string} tooltipPlacement Position of tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Get current position and center map on it.
 */
.directive('anolGeolocation', ['$compile', '$translate', '$timeout', 'MapService', 'ControlsService', 'LayersService', 'InteractionsService',
  function($compile, $translate, $timeout, MapService, ControlsService, LayersService, InteractionsService) {
    return {
      scope: {
        anolGeolocation: '@',
        disableButton: '@',
        zoom: '@',
        tooltipPlacement: '@',
        tooltipDelay: '@',
        tooltipEnable: '@',
        showPosition: '@',
        highlight: '@',
        resultStyle: '=?'
      },
      templateUrl: function(tElement, tAttrs) {
          var defaultUrl = 'src/modules/geolocation/templates/geolocation.html';
          return tAttrs.templateUrl || defaultUrl;
      },
      link: function(scope, element) {
        scope.anolGeolocation = 'false' !== scope.anolGeolocation;
        scope.showPosition = 'false' !== scope.showPosition;
        scope.highlight = angular.isDefined(scope.highlight) ? parseInt(scope.highlight) : false;

        // attribute defaults
        scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
          scope.tooltipPlacement : 'right';
        scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
          scope.tooltipDelay : 500;
        scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
          scope.tooltipEnable : !ol.has.TOUCH;

        if(scope.showPosition) {
          var geolocationLayer = new anol.layer.Feature({
            name: 'geolocationLayer',
            displayInLayerswitcher: false,
            style: scope.resultStyle
          });
          var geolocationOlLayerOptions = geolocationLayer.olLayerOptions;
          geolocationOlLayerOptions.source = new geolocationLayer.OL_SOURCE_CLASS(geolocationLayer.olSourceOptions);
          geolocationLayer.setOlLayer(new geolocationLayer.OL_LAYER_CLASS(geolocationOlLayerOptions));

          LayersService.addSystemLayer(geolocationLayer);
        }

        if('true' !== scope.disableButton) {
          var button = angular.element('');
          element.addClass('anol-geolocation');
          element.append($compile(button)(scope));
        }

        var changeCursorCondition = function(pixel) {
            return MapService.getMap().hasFeatureAtPixel(pixel, function(layer) {
                return geolocationLayer === layer.get('anolLayer');
            });
        };

        var addGeolocationFeatures = function(accuracyGeometry, position) {
          var features = [];
          if(accuracyGeometry !== undefined && accuracyGeometry !== null) {
            features.push(new ol.Feature({
              geometry: accuracyGeometry
            }));
          }
          if(position !== undefined && position !== null) {
            features.push(new ol.Feature({
              geometry: new ol.geom.Point(position)
            }));
          }
          if(features.length > 0) {
            geolocationLayer.addFeatures(features);

            if(scope.highlight > 0) {
              $timeout(function() {
                geolocationLayer.clear();
              }, scope.highlight);
            } else {
              removeGeolocationFeaturesInteraction = new ol.interaction.Select({
                layers: [geolocationLayer.olLayer]
              });
              removeGeolocationFeaturesInteraction.on('select', function(evt) {
                if(evt.selected.length > 0) {
                  removeGeolocationFeaturesInteraction.getFeatures().clear();
                  geolocationLayer.clear();
                  InteractionsService.removeInteraction(removeGeolocationFeaturesInteraction);
                  MapService.removeCursorPointerCondition(changeCursorCondition);
                  removeGeolocationFeaturesInteraction = undefined;
                }
              });
              InteractionsService.addInteraction(removeGeolocationFeaturesInteraction);
              MapService.addCursorPointerCondition(changeCursorCondition);
            }
          }
        };

        var view = MapService.getMap().getView();
        var geolocation = new ol.Geolocation({
          projection: view.getProjection(),
          tracking: scope.anolGeolocation,
          trackingOptions: {
            enableHighAccuracy: true,
            maximumAge: 0
          }
        });

        geolocation.on('change:accuracyGeometry', function() {
          geolocation.setTracking(false);
          var position = geolocation.getPosition();
          var accuracyGeometry = geolocation.getAccuracyGeometry();
          var constrainedPosition = view.constrainCenter(position);
          if(position[0] !== constrainedPosition[0] || position[1] !== constrainedPosition[1]) {
            $translate('anol.geolocation.POSITION_OUT_OF_MAX_EXTENT').then(function(translation) {
              scope.$emit('anol.geolocation', {'message': translation, 'type': 'error'});
            });
            return;
          }
          if(scope.showPosition) {
            addGeolocationFeatures(accuracyGeometry, position);
          }
          view.setCenter(position);
          view.fit(accuracyGeometry.getExtent(), MapService.getMap().getSize());
          if(angular.isDefined(scope.zoom) && parseInt(scope.zoom) < view.getZoom()) {
            view.setZoom(parseInt(scope.zoom));
          }
        });

        scope.locate = function() {
          if(scope.showPosition) {
            geolocationLayer.clear();
          }
          geolocation.setTracking(true);
        };

        element.addClass('ol-control');

        ControlsService.addControl(new anol.control.Control({
          element: element
        }));
      }
    };
}]);
;
angular.module('anol.getfeatureinfo')
/**
 * @ngdoc directive
 * @name anol.getfeatureinfo.directive:anolGetFeatureInfo
 *
 * @restrict A
 * @requires $http
 * @required $window
 * @requires anol.map.MapService
 * @requires anol.map.LayersService
 * @requires anol.map.ControlsService
 *
 * @description
 * Makes GetFeatureInfo request on all non vector layers with 'featureinfo' property
 * and show result if not empty depending on 'target' specified in 'featureinfo'
 *
 * @param {function} customTargetFilled Callback called after featureinfo result added to custom element
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {function} beforeRequest Callback called before featureinfo requests are fulfilled
 * @param {string} proxyUrl Url for proxy to use for requests.
                            When proxyUrl is used, name of requested anol layer
 *                          is appended as path to proxyUrl. E.g.: proxyUrl = '/foo', for layer with name 'bar' requested url is '/foo/bar/'.
 *                          Also only url params are submitted.
 *
 * Layer property **featureinfo** - {Object} - Contains properties:
 * - **target** - {string} - Target for featureinfo result. ('_blank', '_popup', [element-id])
 */
.directive('anolGetFeatureInfo', [
    '$http', '$window', '$q', '$compile', 'MapService', 'LayersService', 'ControlsService',
    function($http, $window, $q, $compile, MapService, LayersService, ControlsService) {
    return {
        restrict: 'A',
        scope: {
            customTargetFilled: '&',
            beforeRequest: '&',
            proxyUrl: '@',
            popupOpeningDirection: '@',
            waitingMarkerSrc: '@?',
            waitingMarkerOffset: '=?',
            excludeLayers: '=?'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/getfeatureinfo/templates/getfeatureinfo.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: {
            pre: function(scope, element) {
                scope.popupOpeningDirection = scope.popupOpeningDirection || 'top';

                scope.map = MapService.getMap();
                // get callback from wrapper function
                scope.customTargetCallback = scope.customTargetFilled();
                scope.beforeRequest = scope.beforeRequest();

                if(scope.waitingMarkerSrc !== undefined) {
                    scope.waitingOverlayElement = element.find('#get-featureinfo-waiting-overlay');
                    $compile(scope.waitingOverlayElement)(scope);
                    scope.waitingOverlay = new ol.Overlay({
                        element: scope.waitingOverlayElement[0],
                        position: undefined,
                        offset: scope.waitingMarkerOffset
                    });
                    scope.map.addOverlay(scope.waitingOverlay);
                }
                var view = scope.map.getView();

                if(angular.isDefined(scope.proxyUrl)) {
                    if(scope.proxyUrl[scope.proxyUrl.length - 1] !== '/') {
                        scope.proxyUrl += '/';
                    }
                }

                var featureInfoLayer = new anol.layer.Feature({
                  name: 'featureInfoLayer',
                  displayInLayerswitcher: false,
                  style: scope.markerStyle
                });
                var markerOlLayerOptions = featureInfoLayer.olLayerOptions;
                markerOlLayerOptions.source = new featureInfoLayer.OL_SOURCE_CLASS(featureInfoLayer.olSourceOptions);
                featureInfoLayer.setOlLayer(new featureInfoLayer.OL_LAYER_CLASS(markerOlLayerOptions));

                LayersService.addSystemLayer(featureInfoLayer, 0);

                var handleFeatureinfoResponses = function(featureInfoObjects) {
                    var divTargetCleared = false;
                    var popupContentTemp = $('<div></div>');
                    var popupCoordinate;
                    angular.forEach(featureInfoObjects, function(featureInfoObject) {
                        if(angular.isUndefined(featureInfoObject)) {
                            return;
                        }
                        var iframe;
                        if(featureInfoObject.target === '_popup') {
                            iframe = $('<iframe seamless src="' + featureInfoObject.url + '"></iframe>');
                        }
                        switch(featureInfoObject.target) {
                            case '_blank':
                                $window.open(featureInfoObject.url, '_blank');
                            break;
                            case '_popup':
                                iframe.css('width', featureInfoObject.width || 300);
                                iframe.css('height', featureInfoObject.height || 150);
                                popupContentTemp.append(iframe);
                                popupCoordinate = featureInfoObject.coordinate;
                            break;
                            default:
                                var temp = $('<div></div>');
                                var target = angular.element(featureInfoObject.target);
                                if(divTargetCleared === false) {
                                    target.empty();
                                    divTargetCleared = true;
                                }
                                var content = angular.element(featureInfoObject.response);
                                temp.append(content);
                                temp.find('meta').remove();
                                temp.find('link').remove();
                                temp.find('title').remove();
                                temp.find('script').remove();
                                target.append(temp.children());
                                if(angular.isFunction(scope.customTargetCallback)) {
                                    scope.customTargetCallback();
                                }
                            break;
                        }
                    });
                    if(angular.isDefined(popupCoordinate)) {
                        scope.popupProperties = {
                            coordinate: popupCoordinate,
                            content: popupContentTemp.children()
                        };
                    }
                    scope.hideWaitingOverlay();
                };

                var handleGMLFeatureinfoResponses = function(responses) {
                    var format = new ol.format.WMSGetFeatureInfo();

                    angular.forEach(responses, function(response) {
                        if(angular.isUndefined(response)) {
                            return;
                        }
                        if(angular.isUndefined(response.gmlData)) {
                            return;
                        }
                        var features = format.readFeatures(response.gmlData);
                        angular.forEach(features, function(feature) {
                            feature.set('style', response.style);
                        });
                        featureInfoLayer.addFeatures(features);
                    });
                };

                scope.handleClick = function(evt) {
                    var viewResolution = view.getResolution();
                    var coordinate = evt.coordinate;

                    scope.popupProperties = {coordinate: undefined};
                    featureInfoLayer.clear();

                    if(angular.isFunction(scope.beforeRequest)) {
                        scope.beforeRequest();
                    }

                    scope.showWaitingOverlay(coordinate);

                    var requestPromises = [];
                    // this is resolved after all requests started
                    var requestsDeferred = $q.defer();
                    requestsDeferred.promise.then(function() {
                        // promises added before requests started
                        // all promises will be resolved, otherwise we can't access the data
                        // promises that should be rejected will be resolved with undefined
                        $q.all(requestPromises).then(handleFeatureinfoResponses);
                    });

                    var gmlRequestPromises = [];
                    var gmlRequestsDeferred = $q.defer();
                    gmlRequestsDeferred.promise.then(function() {
                        $q.all(requestPromises.concat(gmlRequestPromises)).then(handleGMLFeatureinfoResponses);
                    });

                    angular.forEach(LayersService.flattedLayers(), function(layer) {
                        if(!layer.getVisible()) {
                            return;
                        }
                        if(layer.olLayer instanceof ol.layer.Vector) {
                            return;
                        }
                        if(!layer.featureinfo) {
                            return;
                        }

                        var requestParams ={
                            'INFO_FORMAT': 'text/html'
                        };
                        if(angular.isDefined(layer.featureinfo.featureCount)) {
                            requestParams.FEATURE_COUNT = layer.featureinfo.featureCount;
                        }

                        var url = layer.getFeatureInfoUrl(
                            coordinate, viewResolution, view.getProjection(), requestParams
                        );
                        if(angular.isDefined(scope.proxyUrl)) {
                            url = scope.proxyUrl + layer.name + '/?' + url.split('?')[1];
                        }
                        if(angular.isDefined(url)) {
                            var requestDeferred = $q.defer();
                            requestPromises.push(requestDeferred.promise);
                            $http.get(url).then(
                                function(response) {
                                    if(angular.isString(response.data) && response.data !== '' && response.data.search('^\s*<\?xml') === -1) {
                                        requestDeferred.resolve({
                                            target: layer.featureinfo.target,
                                            width: layer.featureinfo.width,
                                            height: layer.featureinfo.height,
                                            url: url,
                                            response: response.data,
                                            coordinate: coordinate
                                        });
                                    } else {
                                        requestDeferred.resolve();
                                    }
                                },
                                function(response) {
                                    requestDeferred.resolve();
                                }
                            );
                        }

                        if(layer.featureinfo.gml !== true) {
                            return;
                        }

                        var gmlRequestParams = {
                            'INFO_FORMAT': 'application/vnd.ogc.gml'
                        };

                        if(angular.isDefined(layer.featureinfo.featureCount)) {
                            gmlRequestParams.FEATURE_COUNT = layer.featureinfo.featureCount;
                        }

                        var gmlUrl = layer.getFeatureInfoUrl(
                            coordinate, viewResolution, view.getProjection(), gmlRequestParams
                        );
                        if(angular.isDefined(scope.proxyUrl)) {
                            gmlUrl = scope.proxyUrl + layer.name + '/?' + gmlUrl.split('?')[1];
                        }

                        if(angular.isDefined(gmlUrl)) {
                            var gmlRequestDeferred = $q.defer();
                            gmlRequestPromises.push(gmlRequestDeferred.promise);
                            $http.get(gmlUrl).then(
                                function(response) {
                                    gmlRequestDeferred.resolve({style: layer.featureinfo.gmlStyle, gmlData: response.data});
                                },
                                function(response) {
                                    gmlRequestDeferred.resolve();
                                }
                            );
                        }
                    });
                    requestsDeferred.resolve();
                    gmlRequestsDeferred.resolve();
                };

                scope.hideWaitingOverlay = function() {
                    if(scope.waitingMarkerSrc !== undefined) {
                        scope.waitingOverlay.setPosition(undefined);
                    }
                };

                scope.showWaitingOverlay = function(coordinate) {
                    if(scope.waitingMarkerSrc !== undefined) {
                        scope.waitingOverlay.setPosition(coordinate);
                    }
                };

                scope.featureInfoPopupClosed = function() {
                    featureInfoLayer.clear();
                };
            },
            post: function(scope) {
                var handlerKey;
                var control = new anol.control.Control({
                    subordinate: true,
                    olControl: null
                });
                control.onDeactivate(function() {
                    scope.map.unByKey(handlerKey);
                });
                control.onActivate(function() {
                    handlerKey = scope.map.on('singleclick', scope.handleClick, this);
                });

                control.activate();

                ControlsService.addControl(control);
            }
        }
    };
}]);
;
angular.module('anol.layerswitcher')

/**
 * @ngdoc directive
 * @name anol.layerswitcher.directive:anolLayerswitcher
 *
 * @restrict A
 * @requires anol.map.LayersService
 * @requires anol.map.ControlsService
 *
 * @param {string} anolLayerswitcher If containing "open" layerswitcher initial state is expanded. Otherweise it is collapsed.
 * @param {string} tooltipPlacement Position of tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Shows/hides background- and overlaylayer
 */
 // TODO handle add / remove layer
 // TODO handle edit layers title
.directive('anolLayerswitcher', ['LayersService', 'ControlsService', 'MapService', function(LayersService, ControlsService, MapService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/layerswitcher/templates/layerswitcher.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        scope: {
            anolLayerswitcher: '@anolLayerswitcher',
            tooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@'
        },
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.collapsed = false;
                scope.showToggle = false;

                // attribute defaults
                scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                    scope.tooltipPlacement : 'left';
                scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                    scope.tooltipDelay : 500;
                scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                    scope.tooltipEnable : !ol.has.TOUCH;

                scope.backgroundLayers = LayersService.backgroundLayers;
                var overlayLayers = [];

                angular.forEach(LayersService.overlayLayers, function(layer) {
                    if(layer.displayInLayerswitcher !== false) {
                        overlayLayers.push(layer);
                    }
                });
                scope.overlayLayers = overlayLayers;
                if(angular.isObject(AnolMapController)) {
                    scope.collapsed = scope.anolLayerswitcher !== 'open';
                    scope.showToggle = true;
                    ControlsService.addControl(
                        new anol.control.Control({
                            element: element
                        })
                    );
                }
            },
            post: function(scope, element, attrs) {
                scope.backgroundLayer = LayersService.activeBackgroundLayer();
                scope.$watch('backgroundLayer', function(newVal, oldVal) {
                    if(angular.isDefined(oldVal)) {
                        oldVal.setVisible(false);
                    }
                    if(angular.isDefined(newVal)) {
                        newVal.setVisible(true);
                    }
                });
                MapService.getMap().getLayers().on('add', function() {
                    var overlayLayers = [];
                    angular.forEach(LayersService.overlayLayers, function(layer) {
                        if(layer.displayInLayerswitcher !== false) {
                            overlayLayers.push(layer);
                        }
                    });
                    scope.backgroundLayers = LayersService.backgroundLayers;
                    scope.overlayLayers = overlayLayers;
                });
            }
        },
        controller: function($scope, $element, $attrs) {
            $scope.isGroup = function(toTest) {
                var result = toTest instanceof anol.layer.Group;
                return result;
            };
            $scope.zoomToLayerExtent = function(layer) {
                if(!layer instanceof anol.layer.Feature) {
                    return;
                }
                var extent = layer.extent();
                if(extent === false) {
                    return;
                }
                var map = MapService.getMap();
                map.getView().fit(extent, map.getSize());
            };
            $scope.setBackgroundLayerByName = function(name) {
                $scope.backgroundLayer = LayersService.layerByName(name);
            };
            $scope.removeBackgroundLayer = function() {
                $scope.backgroundLayer = undefined;
            };
            $scope.layerByName = function(name) {
                return LayersService.layerByName(name);
            };
            $scope.layerIsVisibleByName = function(name) {
                var layer = LayersService.layerByName(name);
                if(layer !== undefined) {
                    return layer.getVisible();
                }
                return false;
            };
            $scope.toggleLayerVisibleByName = function(name) {
                var layer = LayersService.layerByName(name);
                if(layer !== undefined) {
                    layer.setVisible(!layer.getVisible());
                }
            };
            $scope.toggleGroupVisibleByName = function(name) {
                var group = LayersService.groupByName(name);
                if(group !== undefined) {
                    group.setVisible(!group.getVisible());
                }
            };
            $scope.groupIsVisibleByName = function(name) {
                var group = LayersService.groupByName(name);
                if(group !== undefined) {
                    return group.getVisible();
                }
                return false;
            };
        }
    };
}]);
;
angular.module('anol.legend')
/**
 * @ngdoc directive
 * @name anol.legend.directive:anolLegend
 *
 * @restrict A
 * @requires anol.map.LayersService
 * @requires anol.map.ControlsSerivce
 *
 * @param {string} anolLegend If containing "open" legend initial state is expanded. Otherweise it is collapsed.
 * @param {function} customTargetFilled
 * @param {string} tooltipPlacement Position of tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens}
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {boolean} showInactive If true a legend item for not visible layers with legend options is also created
 *
 * @description
 * Adds a legend to map
 */
.directive('anolLegend', ['LayersService', 'ControlsService', function(LayersService, ControlsService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
          var defaultUrl = 'src/modules/legend/templates/legend.html';
          return tAttrs.templateUrl || defaultUrl;
        },
        scope: {
            anolLegend: '@',
            // TODO compare with featurepopup openCallback. Why a callback wrapper is added here?
            customTargetFilled: '&',
            tooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@',
            showInactive: '@'
        },
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.collapsed = false;
                scope.showToggle = false;

                //attribute defaults
                scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                    scope.tooltipPlacement : 'left';
                scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                    scope.tooltipDelay : 500;
                scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                    scope.tooltipEnable : !ol.has.TOUCH;
                scope.showInactive = (scope.showInactive === true || scope.showInactive === 'true');

                // get callback from wrapper function
                if(angular.isFunction(scope.customTargetFilled())) {
                    scope.customTargetCallback = scope.customTargetFilled();
                }
                if(angular.isObject(AnolMapController)) {
                    scope.collapsed = scope.anolLegend !== 'open';
                    scope.showToggle = true;
                    element.addClass('anol-legend');
                    ControlsService.addControl(
                        new anol.control.Control({
                            element: element
                        })
                    );
                }
            },
            post: function(scope, element, attrs) {
                scope.legendLayers = [];

                angular.forEach(LayersService.flattedLayers(), function(layer) {
                    if(layer.legend === false) {
                        return;
                    }
                    scope.legendLayers.push(layer);
                });
            }
        }
    };
}])

/**
 * @ngdoc directive
 * @name anol.legend.directive:anolLegendImage
 *
 * @restrict A
 * @requires $compile
 *
 * @param {anol.layer} anolLegendImage Layer to add legend image for.
 * @param {function} customTargetFilled Callback for show legend button
 * @param {boolean} prepend Add legend image before (true) or after (false) transcluded element(s)
 * @param {Array<number>} size Size of canvas when generating legend image for vector layer
 *
 * @description
 * Creates a legend image based on layer.legend configuration.
 * When url is defined in layer.legend, an image with src = layer.legend.url is appended to legend.
 * The url property is available for all types of layers.
 * For vector layers layer.legend.type can be one of `point`, `line` or `polygon`. A legend entry depending on layer style is created.
 * For raster layers with defined layer.legend a legend entry with result of getLegendGraphic request is created.
 * For raster layers, if layer.legend.target points to a html element class or id, a button is rendered instead of legend image. After button pressed
 * legend image is shown in element with given id/class.
 */
.directive('anolLegendImage', ['$compile', function($compile) {
    return {
        restrict: 'A',
        scope: {
            legendLayer: '=anolLegendImage',
            customTargetFilled: '&',
            prepend: '=',
            size: '='
        },
        link: function(scope, element, attrs) {
            var VectorLegend = {
                createCanvas: function() {
                    var canvas = angular.element('<canvas></canvas>');
                    canvas.addClass('anol-legend-item-image');
                    canvas[0].width = scope.width;
                    canvas[0].height = scope.height;
                    return canvas;
                },
                drawPointLegend: function(style) {
                    var ratio;
                    var canvas = VectorLegend.createCanvas();
                    var ctx = canvas[0].getContext('2d');

                    if(angular.isFunction(style.getImage().getSrc)) {
                        var width, height;
                        var iconSize = style.getImage().getSize();
                        if(scope.width >= scope.height) {
                            ratio = iconSize[0] / iconSize[1];
                            width = scope.width * ratio;
                            height = scope.height;
                        } else {
                            ratio = iconSize[1] / iconSize[0];
                            height = scope.height * ratio;
                            width = scope.width;
                        }
                        var img = new Image();
                        img.src = style.getImage().getSrc();

                        var positionLeft = (scope.width - width) / 2;
                        var positionTop = (scope.height - height) / 2;
                        img.onload = function() {
                            ctx.drawImage(img, positionLeft, positionTop, width, height);
                        };
                    } else {
                        var x = scope.width / 2;
                        var y = scope.height / 2;
                        var r = (Math.min(scope.width, scope.height) / 2) - 2;
                        ratio = r / style.getImage().getRadius();
                        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
                        ctx.strokeStyle = ol.color.asString(style.getImage().getStroke().getColor());
                        ctx.lineWidth = style.getImage().getStroke().getWidth() * ratio;
                        ctx.fillStyle = ol.color.asString(style.getImage().getFill().getColor());
                        ctx.fill();
                        ctx.stroke();
                    }
                    return canvas;
                },
                drawLineLegend: function(style) {
                    var canvas = VectorLegend.createCanvas();
                    var ctx = canvas[0].getContext('2d');
                    var minX = 2;
                    var maxX = scope.width - 2;
                    var y = scope.height / 2;
                    ctx.moveTo(minX, y);
                    ctx.lineTo(maxX, y);
                    ctx.strokeStyle = ol.color.asString(style.getStroke().getColor());
                    ctx.lineWidth = style.getStroke().getWidth();
                    ctx.stroke();
                    return canvas;
                },
                drawPolygonLegend: function(style) {
                    var canvas = VectorLegend.createCanvas();
                    var ctx = canvas[0].getContext('2d');

                    var minX = 1;
                    var minY = 1;
                    var maxX = scope.width - 2;
                    var maxY = scope.height - 2;
                    ctx.rect(minX, minY, maxX, maxY);
                    ctx.fillStyle = ol.color.asString(style.getFill().getColor());
                    ctx.strokeStyle = ol.color.asString(style.getStroke().getColor());
                    ctx.lineWidth = style.getStroke().getWidth();
                    ctx.fill();
                    ctx.stroke();
                    return canvas;
                },
                createLegendEntry: function(title, type, style) {
                    if(angular.isFunction(style)) {
                        style = style()[0];
                    }
                    switch(type) {
                        case 'point':
                            return VectorLegend.drawPointLegend(style);
                        case 'line':
                            return VectorLegend.drawLineLegend(style);
                        case 'polygon':
                            return VectorLegend.drawPolygonLegend(style);
                        default:
                            return;
                    }
                }
            };

            var RasterLegend = {
                createLegendEntry: function(layer) {
                    var legendImages = $('<div></div>');
                    if(layer.getLegendGraphicUrl === undefined) {
                        return;
                    }
                    var legendImage = $('<img>');
                    legendImage.addClass('anol-legend-item-image');
                    legendImage.attr('src', layer.getLegendGraphicUrl());
                    legendImages.append(legendImage);

                    // Display in element with given id
                    if (angular.isDefined(layer.legend.target)) {
                        var target = angular.element(layer.legend.target);
                        var showLegendButton = angular.element('<button>{{ \'anol.legend.SHOW\' | translate }}</button>');
                        showLegendButton.addClass('btn');
                        showLegendButton.addClass('btn-sm');
                        showLegendButton.on('click', function() {
                            target.empty();
                            target.append(legendImages);
                            if(angular.isFunction(scope.customTargetCallback)) {
                                scope.customTargetCallback();
                            }
                        });
                        return $compile(showLegendButton)(scope);
                    // Display in legend control
                    } else {
                        return legendImages;
                    }
                }
            };

            var ImageLegend = {
                createLegendEntry: function(title, url) {
                    var legendImage = angular.element('<img>');
                    legendImage.addClass('anol-legend-item-image');
                    legendImage[0].src = url;
                    return legendImage;
                }
            };

            if(angular.isFunction(scope.customTargetFilled())) {
                scope.customTargetCallback = scope.customTargetFilled();
            }
            if(angular.isArray(scope.size)) {
                scope.width = scope.size[0];
                scope.height = scope.size[1];
            } else {
                scope.width = 20;
                scope.height = 20;
            }

            var legendItem;

            if(scope.legendLayer.legend.url !== undefined) {
                legendItem = ImageLegend.createLegendEntry(scope.legendLayer.title, scope.legendLayer.legend.url);
            } else if(scope.legendLayer.olLayer instanceof ol.layer.Vector) {
                legendItem = VectorLegend.createLegendEntry(
                    scope.legendLayer.title,
                    scope.legendLayer.legend.type,
                    scope.legendLayer.olLayer.getStyle()
                );
            } else {
                legendItem = RasterLegend.createLegendEntry(scope.legendLayer);
            }
            if(scope.prepend === true) {
                element.prepend(legendItem);
            } else {
                element.append(legendItem);
            }
        }
    };
}]);
;
angular.module('anol.measure')
/**
 * @ngdoc directive
 * @name anol.measure.directive:anolLineMeasure
 *
 * @requires anol.map.MapService
 * @requires anol.map.ControlsSerivce
 * @requries anol.map.LayersService
 *
 * @param {string} anolMeasure Type of measurement. Supported values are *line* and *area*. Default: *line*
 * @param {boolean} geodesic Use geodesic measure method
 * @param {ol.style.Style} style Style for drawed measures
 * @param {string} tooltipPlacement Position of tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 * @param {string} templateUrl Url to template to use instead of default one
 * @param {boolean} addToMap Create control and add to map when placed inside map. Default: true
 * @param {function} activate Pass name of function to activate control from outer scope
 * @param {function} decativate Pass name of function to deactivate control from outer scope
 * @param {function} measureResultCallback Given function is called when measure result is available
 * @param {function} activatedCallback Given function is called when control is activated
 * @param {function} deactivatedCallback Given function is called when control is deactivated
 *
 * @description
 * Point, Line or area measurement
 */
.directive('anolMeasure', ['$timeout', 'ControlsService', 'LayersService', 'MapService', function($timeout, ControlsService, LayersService, MapService) {
    // create a sphere whose radius is equal to the semi-major axis of the WGS84 ellipsoid
    var wgs84Sphere = new ol.Sphere(6378137);
    var measureStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
            opacity: 0.5
        }),
        image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.7)'
            })
        })
    });

    var calculateCoordinate = function(geometry, projection, geodesic) {
        return geometry.getCoordinates();
    };

    var calculateLength = function(geometry, projection, geodesic) {
        if(geometry.getType() !== 'LineString') {
            return 0;
        }
        var length;
        if (geodesic) {
            var coordinates = geometry.getCoordinates();
            length = 0;
            for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                var c1 = ol.proj.transform(coordinates[i], projection, 'EPSG:4326');
                var c2 = ol.proj.transform(coordinates[i + 1], projection, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
            }
        } else {
            length = Math.round(geometry.getLength() * 100) / 100;
        }
        return length;
    };

    var calculateArea = function(geometry, projection, geodesic) {
        if(geometry.getType() !== 'Polygon') {
            return 0.0;
        }
        var area;
        if (geodesic) {
            var geom = /** @type {ol.geom.Polygon} */(geometry.clone().transform(
                projection, 'EPSG:4326'));
            var coordinates = geom.getLinearRing(0).getCoordinates();
            area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
        } else {
            area = geometry.getArea();
        }
        return area;
    };

    var formatCoordinateResult = function(geometry, projection, geodesic) {
        var coord = ol.proj.transform(geometry.getCoordinates(),
                                     projection,
                                     'EPSG:4326');
        var output = '';
        output += coord[0] + ' lat | ';
        output += coord[1] + ' lon';
        return output;
    };

    var formatLineResult = function(geometry, projection, geodesic) {
        var length = calculateLength(geometry, projection, geodesic);
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
        }
        return output;
    };

    var formatAreaResult = function(geometry, projection, geodesic) {
        var area = calculateArea(geometry, projection, geodesic);
        var output;
        if (area > 10000) {
            output = (Math.round(area / 10000 * 100) / 100) +
                     ' ' + 'ha';
        } else {
            output = Math.round(area) +
                     ' ' + 'm<sup>2</sup>';
      }
      return output;
    };

    var handlePointMeasure = function(geometry, coordinate) {
        return new ol.geom.Point(coordinate);
    };

    var handleLineMeasure = function(geometry, coordinate) {
        switch(geometry.getType()) {
            case 'Point':
                return new ol.geom.LineString([
                    geometry.getCoordinates(),
                    coordinate
                ]);
            case 'LineString':
                var coords = geometry.getCoordinates();
                coords.push(coordinate);
                return new ol.geom.LineString(coords);
        }
    };

    var handleAreaMeasure = function(geometry, coordinate) {
        var coords;
        switch(geometry.getType()) {
            case 'Point':
                return new ol.geom.LineString([
                    geometry.getCoordinates(),
                    coordinate
                ]);
            case 'LineString':
                coords = geometry.getCoordinates();
                coords.push(coordinate);
                coords.push(coords[0]);
                return new ol.geom.Polygon([coords]);
            case 'Polygon':
                coords = geometry.getCoordinates()[0];
                coords.splice(coords.length - 1, 0, coordinate);
                return new ol.geom.Polygon([coords]);
        }
    };

    var createMeasureOverlay = function() {
        var element = angular.element('<div></div>');
        element.addClass('anol-overlay');
        element.addClass('anol-measure-overlay');
        var overlay = new ol.Overlay({
            element: element[0],
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        return overlay;
    };

    var createModifyInteraction = function(measureSource, measureType, measureOverlay, measureResultCallback, projection, geodesic) {
        var modify = new ol.interaction.Modify({
            features: measureSource.getFeaturesCollection()
        });
        modify.on('modifyend', function(evt) {
            var resultFormatter, resultCalculator;
            switch(measureType) {
                case 'point':
                    resultCalculator = calculateCoordinate;
                    resultFormatter = formatCoordinateResult;
                    break;
                case 'line':
                    resultCalculator = calculateLength;
                    resultFormatter = formatLineResult;
                    break;
                case 'area':
                    resultCalculator = calculateArea;
                    resultFormatter = formatAreaResult;
                    break;
            }
            var geometry = measureSource.getFeatures()[0].getGeometry();

            if(angular.isFunction(measureResultCallback)) {
                measureResultCallback({
                    type: measureType,
                    value: resultCalculator(geometry, projection, geodesic)
                });
                return;
            }

            measureOverlay.getElement().innerHTML = resultFormatter(geometry, projection, geodesic);
            measureOverlay.setPosition(geometry.getLastCoordinate());
        });
        return modify;
    };

    var createDrawInteraction = function(measureSource, measureType, measureOverlay, measureResultCallback, projection, geodesic) {
        var draw = new ol.interaction.Draw({
            type: 'Point',
            style: new ol.style.Style({})
        });

        draw.on('drawstart',
            function(evt) {
                var sketch = evt.feature;

                /** @type {ol.Coordinate|undefined} */
                var coord = evt.coordinate;
                measureOverlay.setPosition(coord);

                var geometryCreator;
                var resultCalculator;
                var resultFormatter;
                switch(measureType) {
                    case 'point':
                        geometryCreator = handlePointMeasure;
                        resultCalculator = calculateCoordinate;
                        resultFormatter = formatCoordinateResult;
                        break;
                    case 'line':
                        geometryCreator = handleLineMeasure;
                        resultCalculator = calculateLength;
                        resultFormatter = formatLineResult;
                        break;
                    case 'area':
                        geometryCreator = handleAreaMeasure;
                        resultCalculator = calculateArea;
                        resultFormatter = formatAreaResult;
                        break;
                }

                var features = measureSource.getFeatures();
                if(features.length === 0) {
                    measureSource.addFeature(sketch);
                    if(angular.isFunction(measureResultCallback)) {
                        measureResultCallback({
                            type: measureType,
                            value: resultCalculator(sketch.getGeometry(), projection, geodesic)
                        });
                    }
                    return;
                }

                var newGeometry = geometryCreator(features[0].getGeometry(),
                                                  sketch.getGeometry().getCoordinates());
                features[0].setGeometry(newGeometry);

                if(angular.isFunction(measureResultCallback)) {
                    measureResultCallback({
                        type: measureType,
                        value: resultCalculator(newGeometry, projection, geodesic)
                    });
                    return;
                }

                measureOverlay.getElement().innerHTML = resultFormatter(newGeometry, projection, geodesic);
                measureOverlay.setPosition(newGeometry.getLastCoordinate());
            }, this
        );
        return draw;
    };

    return {
        restrict: 'A',
        require: '?^anolMap',
        replace: true,
        scope: {
            measureType: '@anolMeasure',
            geodesic: '@',
            style: '=?',
            tooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@',
            addToMap: '@?',
            activate: '=?',
            deactivate: '=?',
            measureResultCallback: '=?',
            activatedCallback: '=?',
            deactivatedCallback: '=?'
        },
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/measure/templates/measure.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        link: function(scope, element, attrs, AnolMapController) {
            //attribute defaults
            scope.tooltipPlacement = angular.isDefined(scope.tooltipPlacement) ?
                scope.tooltipPlacement : 'right';
            scope.tooltipDelay = angular.isDefined(scope.tooltipDelay) ?
                scope.tooltipDelay : 500;
            scope.tooltipEnable = angular.isDefined(scope.tooltipEnable) ?
                scope.tooltipEnable : !ol.has.TOUCH;
            scope.geodesic = scope.geodesic === true || scope.geodesic === 'true';
            var control;

            // create layer to draw in
            var measureSource = new ol.source.Vector({
                useSpatialIndex: false
            });
            var _measureLayer = new ol.layer.Vector({
                source: measureSource,
                style: scope.style || measureStyle,
                zIndex: 2
            });

            var layerOptions = {
                title: 'lineMeasureLayer',
                name: 'lineMeasureLayer',
                displayInLayerswitcher: false,
                olLayer: _measureLayer
            };

            var map = MapService.getMap();

            var measureOverlay = createMeasureOverlay();

            var draw = createDrawInteraction(measureSource,
                                             scope.measureType,
                                             measureOverlay,
                                             scope.measureResultCallback,
                                             map.getView().getProjection(),
                                             scope.geodesic);

            var modify = createModifyInteraction(measureSource,
                                                 scope.measureType,
                                                 measureOverlay,
                                                 scope.measureResultCallback,
                                                 map.getView().getProjection(),
                                                 scope.geodesic);

            scope.measure = function() {
                if(control.active) {
                    control.deactivate();
                } else {
                    control.activate();
                }
            };

            var deactivate = function() {
                map.removeInteraction(draw);
                map.removeInteraction(modify);
                measureSource.clear();
                map.removeOverlay(measureOverlay);
                measureOverlay.getElement().innerHTML = '';
                if(angular.isFunction(scope.deactivatedCallback)) {
                    scope.deactivatedCallback();
                }
            };

            var activate = function() {
                map.addInteraction(draw);
                map.addInteraction(modify);
                map.addOverlay(measureOverlay);
                if(angular.isFunction(scope.activatedCallback)) {
                    scope.activatedCallback();
                }
            };

            scope.deactivate = function() {
                control.deactivate();
            };

            scope.activate = function() {
                control.activate();
            };

            LayersService.addSystemLayer(new anol.layer.Layer(layerOptions), 0);

            if(AnolMapController === null || scope.addToMap === false || scope.addToMap === 'false') {
                control = new anol.control.Control({
                    exclusive: true,
                    olControl: null
                });
            } else {
                element.addClass('ol-control');
                element.addClass('anol-measure-' + scope.measureType);
                control = new anol.control.Control({
                    element: element,
                    exclusive: true
                });
            }

            control.onDeactivate(deactivate);
            control.onActivate(activate);
            ControlsService.addControl(control);
        }
    };
}]);
;
angular.module('anol.mouseposition')

/**
 * @ngdoc directive
 * @name anol.mouseposition.directive:anolMousePosition
 *
 * @requires $compile
 * @requires anol.map.MapService
 * @requires anol.map.ControlsService
 *
 * @param {number@} precision Number of decimal digets coordinates are round to
 * @param {projectionCode=} Variable containing projection coordinates are displayed in
 *
 * @description
 * Shows current mouse position in map units in container or
 * in map if directive devined in `anolMapDirective`
 *
 * *anolMousePosition* have to contain a format string for displaying coordinates.
 * Therefor *anolMousePosition* prepate 3 variables to be placed in format string.
 * - *x* for x-position
 * - *y* for y-position
 * - *mapUnits* for current map units
 *
 *  @example
 * ```html
    <div anol-mouse-position >{{x}} {{ mapUnits }} {{y}} {{ mapUnits }}</div>
    ```
 */
.directive('anolMousePosition', ['$compile', 'MapService', 'ControlsService', function($compile, MapService, ControlsService) {
    return {
        restrict: 'A',
        require: '?^anolMap',
        scope: {
            precision: '@',
            projectionCode: '='
        },
        link: {
            pre: function(scope, element, attrs) {
                $compile(element.contents())(scope);
                scope.map = MapService.getMap();
                if(angular.isDefined(scope.projectionCode)) {
                    scope.projection = ol.proj.get(scope.projectionCode);
                } else {
                    scope.projection = scope.map.getView().getProjection();
                    scope.projectionCode = scope.projection.getCode();
                }
                scope.mapUnits = scope.projection.getUnits();

                scope.precision = parseInt(scope.precision || 0);
            },
            post: function(scope, element, attrs, AnolMapController) {
                var inMap = angular.isObject(AnolMapController);
                var olControl = new ol.control.MousePosition({
                    coordinateFormat: function(coordinate) {
                        scope.x = coordinate[0].toFixed(scope.precision);
                        scope.y = coordinate[1].toFixed(scope.precision);
                        scope.$digest();
                        return inMap ? element.html() : '';
                    }
                });

                var control = new anol.control.Control({
                    olControl: olControl
                });

                if(!inMap) {
                    element.css('display', 'inherit');
                }
                scope.$watch('projectionCode', function(newVal) {
                    if(angular.isDefined(newVal)) {
                        scope.projection = ol.proj.get(newVal);
                        scope.mapUnits = scope.projection.getUnits();
                        olControl.setProjection(scope.projection);
                    }
                });

                ControlsService.addControl(control);
            }
        }
    };
}]);
;
angular.module('anol.overviewmap')
/**
 * @ngdoc directive
 * @name anol.overviewmap.directive:anolOverviewMap
 *
 * @requires $compile
 * @requires anol.map.ControlsSerivce
 * @requries anol.map.LayersService
 * @requries anol.map.MapService
 *
 * @param {boolean} anolOverviewMap Wheather start collapsed or not. Default true.
 * @param {string} tooltipPlacement Position of tooltip
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 *
 * @description
 * Adds a overview map
 */
.directive('anolOverviewMap', ['$compile', 'ControlsService', 'LayersService', 'MapService', function($compile, ControlsService, LayersService, MapService) {
    return {
        restrict: 'A',
        scope: {
            collapsed: '@anolOverviewMap',
            tooltipPlacement: '@',
            tooltipDelay: '@'
        },
        link: function(scope, element, attrs) {
            scope.collapsed = scope.collapsed !== false;
            var backgroundLayers = [];
            angular.forEach(LayersService.backgroundLayers, function(layer) {
                backgroundLayers.push(layer.olLayer);
            });
            // TODO use when resolved
            // https://github.com/openlayers/ol3/issues/3753
            var olControl = new ol.control.OverviewMap({
                layers: backgroundLayers,
                label: document.createTextNode(''),
                collapseLabel: document.createTextNode(''),
                collapsed: scope.collapsed,
                view: new ol.View({
                    projection: MapService.getMap().getView().getProjection()
                })
            });
            var control = new anol.control.Control({
                olControl: olControl
            });

            // disable nativ tooltip
            var overviewmapButton = angular.element(olControl.element).find('button');
            overviewmapButton.removeAttr('title');
            // add cool tooltip
            overviewmapButton.attr('tooltip', '{{ \'anol.overviewmap.TOOLTIP\' | translate }}');
            overviewmapButton.attr('tooltip-placement', scope.tooltipPlacement || 'right');
            overviewmapButton.attr('tooltip-append-to-body', true);
            overviewmapButton.attr('tooltip-popup-delay', scope.tooltipDelay || 500);
            overviewmapButton.attr('tooltip-enable', scope.tooltipEnable === undefined ? !ol.has.TOUCH : scope.tooltipEnable);
            overviewmapButton.attr('tooltip-trigger', 'mouseenter click');
            // add icon
            // cannot use ng-class, because icon change comes to late after click
            overviewmapButton.attr('ng-click', 'updateIcon()');
            var overviewmapButtonIcon = angular.element('<span class="glyphicon glyphicon-chevron-' + (scope.collapsed ? 'right' : 'left') + '"></span>');
            overviewmapButton.append(overviewmapButtonIcon);

            $compile(overviewmapButton)(scope);
            ControlsService.addControl(control);

            scope.updateIcon = function() {
                var collapsed = olControl.getCollapsed();
                overviewmapButtonIcon.removeClass('glyphicon-chevron-' + (collapsed ? 'left' : 'right'));
                overviewmapButtonIcon.addClass('glyphicon-chevron-' + (collapsed ? 'right' : 'left'));
            };
        }
    };
}]);
;
angular.module('anol.permalink')

/**
 * @ngdoc object
 * @name anol.permalink.PermalinkServiceProvider
 */
.provider('PermalinkService', [function() {
    var _urlCrs;
    var _precision = 100000;

    var getParamString = function(param, params) {
        if(angular.isUndefined(params[param])) {
            return false;
        }
        var p = params[param];
        if(angular.isArray(p)) {
            p = p[p.length -1];
        }
        return p;
    };

    var extractMapParams = function(params) {
        var mapParam = getParamString('map', params);
        if(mapParam === false) {
            return false;
        }
        var mapParams = mapParam.split(',');

        var layersParam = getParamString('layers', params);
        var layers;
        if(layersParam !== false) {
            layers = layersParam.split(',');
        }

        if(mapParams !== null && mapParams.length == 4) {
            var result = {
                'zoom': parseInt(mapParams[0]),
                'center': [parseFloat(mapParams[1]), parseFloat(mapParams[2])],
                'crs': mapParams[3]
            };
            if(layers !== undefined) {
                result.layers = layers;
            }
            return result;
        }
        return false;
    };

    /**
     * @ngdoc method
     * @name setUrlCrs
     * @methodOf anol.permalink.PermalinkServiceProvider
     * @param {string} crs EPSG code of coordinates in url
     * @description
     * Define crs of coordinates in url
     */
    this.setUrlCrs = function(crs) {
        _urlCrs = crs;
    };

    /**
     * @ngdoc method
     * @name setPrecision
     * @methodOf anol.permalink.PermalinkServiceProvider
     * @param {number} precision Precision of coordinates in url
     * @description
     * Define precision of coordinates in url
     */
    this.setPrecision = function(precision) {
        _precision = precision;
    };

    this.$get = ['$rootScope', '$location', 'MapService', 'LayersService', function($rootScope, $location, MapService, LayersService) {
        /**
         * @ngdoc service
         * @name anol.permalink.PermalinkService
         *
         * @requires $rootScope
         * @requires $location
         * @requires anol.map.MapService
         * @requires anol.map.LayersService
         *
         * @description
         * Looks for a `map`-parameter in current url and move map to location specified in
         *
         * Updates browser-url with current zoom and location when map moved
         */
        var Permalink = function(urlCrs, precision) {
            var self = this;
            self.precision = precision;
            self.zoom = undefined;
            self.lon = undefined;
            self.lat = undefined;
            self.map = MapService.getMap();
            self.view = self.map.getView();
            self.visibleLayerNames = [];

            self.urlCrs = urlCrs;
            if (self.urlCrs === undefined) {
                var projection = self.view.getProjection();
                self.urlCrs = projection.getCode();
            }

            var params = $location.search();
            var mapParams = extractMapParams(params);
            if(mapParams !== false) {
                self.updateMapFromParameters(mapParams);
            } else {
                angular.forEach(LayersService.flattedLayers(), function(layer) {
                    if(layer.permalink === true) {
                        if(layer.getVisible()) {
                            self.visibleLayerNames.push(layer.name);
                        }
                    }
                });
            }

            self.map.on('moveend', self.moveendHandler, self);

            $rootScope.$watchCollection(function() {
                return LayersService.layers();
            }, function(newVal) {
                if(angular.isDefined(newVal)) {
                    angular.forEach(newVal, function(layer) {
                        if(layer instanceof anol.layer.Group) {
                            angular.forEach(layer.layers, function(groupLayer) {
                                if(groupLayer.permalink === true) {
                                    groupLayer.offVisibleChange(self.handleVisibleChange);
                                    groupLayer.onVisibleChange(self.handleVisibleChange, self);
                                }
                            });
                        } else {
                            if(layer.permalink === true) {
                                layer.offVisibleChange(self.handleVisibleChange);
                                layer.onVisibleChange(self.handleVisibleChange, self);
                            }
                        }
                    });
                }
            });
        };
        /**
         * @private
         */
        Permalink.prototype.handleVisibleChange = function(evt) {
            var self = evt.data.context;
            // this in this context is the layer, visiblie changed for
            var layer = this;
            if(layer.permalink === true) {
                var layerName = layer.name;
                if(angular.isDefined(layerName) && layer.getVisible()) {
                    self.visibleLayerNames.push(layerName);
                } else {
                    var layerNameIdx = $.inArray(layerName, self.visibleLayerNames);
                    if(layerNameIdx > -1) {
                        self.visibleLayerNames.splice(layerNameIdx, 1);
                    }
                }
                self.generatePermalink();
            }
        };
        /**
         * @private
         * @name moveendHandler
         * @methodOf anol.permalink.PermalinkService
         * @param {Object} evt ol3 event object
         * @description
         * Get lat, lon and zoom after map stoped moving
         */
        Permalink.prototype.moveendHandler = function(evt) {
            var self = this;
            var center = ol.proj.transform(self.view.getCenter(), self.view.getProjection(), self.urlCrs);
            self.lon = Math.round(center[0] * this.precision) / this.precision;
            self.lat = Math.round(center[1] * this.precision) / this.precision;

            self.zoom = self.view.getZoom();
            $rootScope.$apply(function() {
                self.generatePermalink();
            });
        };
        /**
         * @private
         * @name generatePermalink
         * @methodOf anol.permalink.PermalinkService
         * @param {Object} evt ol3 event object
         * @description
         * Builds the permalink url addon
         */
        Permalink.prototype.generatePermalink = function(evt) {
            var self = this;
            if(self.zoom === undefined || self.lon === undefined || self.lat === undefined) {
                return;
            }
            $location.search('map', [self.zoom, self.lon, self.lat, self.urlCrs].join(','));
            $location.search('layers', self.visibleLayerNames.join(','));
            $location.replace();
        };
        Permalink.prototype.updateMapFromParameters = function(mapParams) {
            var self = this;
            var center = ol.proj.transform(mapParams.center, mapParams.crs, self.view.getProjection());
            self.view.setCenter(center);
            self.view.setZoom(mapParams.zoom);
            if(mapParams.layers !== false) {
                self.visibleLayerNames = mapParams.layers;
                var backgroundLayerAdded = false;
                angular.forEach(LayersService.layers(), function(layer) {
                    // only overlay layers are grouped
                    if(layer instanceof anol.layer.Group) {
                        angular.forEach(layer.layers, function(groupLayer) {
                            if(groupLayer.permalink !== true) {
                                return;
                            }
                            var visible = mapParams.layers.indexOf(groupLayer.name) !== -1;
                            groupLayer.setVisible(visible);
                        });
                    } else {
                        if(layer.permalink !== true) {
                            return;
                        }
                        var visible = mapParams.layers.indexOf(layer.name) > -1;

                        if(layer.isBackground && visible) {
                            if(!backgroundLayerAdded) {
                                backgroundLayerAdded = true;
                            } else {
                                visible = false;
                            }
                        }
                        layer.setVisible(visible);
                    }
                });
            }
        };
        Permalink.prototype.getPermalinkParameters = function() {
            var self = this;
            return {
                zoom: self.zoom,
                center: [self.lon, self.lat],
                crs: self.urlCrs,
                layers: self.visibleLayerNames
            };
        };
        Permalink.prototype.setPermalinkParameters = function(params) {
            var self = this;
            self.updateMapFromParameters(params);
        };
        return new Permalink(_urlCrs, _precision);
    }];
}]);
;
angular.module('anol.print')
/**
 * @ngdoc directive
 * @name anol.print.directive:anolPrint
 *
 * @requires anol.map.MapService
 * @requires anol.map.LayersService
 * @requires anol.print.PrintService
 * @requires anol.print.PrintPageService
 *
 * @description
 * User print interface with default print attributes.
 * Default print attributes are:
 * **bbox**, **projection** and **layers**.
 * **layers** contains all currently active layers.
 *
 * When *startPrint* called default print arguments plus **tempalteValues** passed to anol.print.PrintService:startPrint.
 * **templateValues** contains all values added to **printAttributes**.
 * When using own print template, all inputs have to use **printAttributes.[name]** as *ng-model* statement.
 * *tempalteValues* can be extended by transclude input fields into directive. *ng-model* value for these fields have to be
 * *$parent.printAttributes.[name]*
 */
.directive('anolPrint', ['PrintService', 'PrintPageService', 'MapService', 'LayersService',
  function(PrintService, PrintPageService, MapService, LayersService) {
    return {
      restrict: 'A',
      templateUrl: function(tElement, tAttrs) {
        var defaultUrl = 'src/modules/print/templates/print.html';
        return tAttrs.templateUrl || defaultUrl;
      },
      scope: {
        showPrintArea: '='
      },
      transclude: true,
      link: {
        pre: function(scope, element, attrs) {
            scope.printAttributes = {
              pageSize: [],
              layout: undefined,
              scale: angular.copy(PrintPageService.defaultScale)
            };
            scope.isPrintableAttributes = {};
            scope.availableScales = PrintPageService.availableScales;
            scope.definedPageLayouts = PrintPageService.pageLayouts;
            scope.outputFormats = PrintPageService.outputFormats;
            if(angular.isArray(scope.outputFormats) && scope.outputFormats.length > 0) {
              scope.printAttributes.outputFormat = scope.outputFormats[0];
            }
            scope.prepareDownload = false;
            scope.downloadReady = false;
            scope.downloadError = false;

            var prepareOverlays = function(layers) {
              var _layers = [];
              angular.forEach(layers, function(layer) {
                if(layer instanceof anol.layer.Group) {
                  _layers = _layers.concat(prepareOverlays(layer.layers.slice().reverse()));
                } else {
                  if(layer.getVisible()) {
                    _layers.push(layer);
                  }
                }
              });
              return _layers;
            };

            scope.startPrint = function() {
              scope.downloadReady = false;
              scope.downloadError = false;
              scope.prepareDownload = true;

              var layers = [LayersService.activeBackgroundLayer()];
              layers = layers.concat(prepareOverlays(LayersService.overlayLayers));

              var downloadPromise = PrintService.startPrint({
                  bbox: PrintPageService.getBounds(),
                  projection: MapService.getMap().getView().getProjection().getCode(),
                  layers: layers,
                  templateValues: angular.copy(scope.printAttributes)
                }
              );

              downloadPromise.then(
                function(response) {
                  var downloadLink = element.find('.download-link');
                  downloadLink.attr('href', response.url);
                  downloadLink.attr('download', response.name);
                  scope.downloadReady = true;
                  scope.prepareDownload = false;
                  scope.removePrintArea();
                },
                function(reason) {
                  if(reason === 'replaced') {
                    return;
                  }
                  scope.prepareDownload = false;
                  scope.downloadError = true;
                }
              );
            };

            // if we assign pageSize = value in template angular put only a reverence
            // into scope.pageSize and typing somethink into width/height input fields
            // will result in modifying selected availablePageSize value
            scope.setPageLayout = function(size, layout) {
                scope.printAttributes.pageSize = PrintPageService.mapToPageSize(angular.copy(size));
                scope.printAttributes.layout = angular.copy(layout);

                var errors = PrintPageService.getSizeErrors(scope.printAttributes.pageSize);
                scope.anolPrint.pageWidth.$error.printPage = errors.width;
                scope.anolPrint.pageHeight.$error.printPage = errors.height;

                scope.updatePrintPage();
            };

            scope.updatePrintPage = function() {
              if(scope.havePageSize()) {
                PrintPageService.addFeatureFromPageSize(scope.printAttributes.pageSize, scope.printAttributes.scale);
              } else {
                PrintPageService.removePrintArea();
              }

              var errors = PrintPageService.getSizeErrors(scope.printAttributes.pageSize);
              scope.anolPrint.pageWidth.$error.printPage = errors.width;
              scope.anolPrint.pageHeight.$error.printPage = errors.height;
            };

            scope.updatePageSize = function() {
              scope.printAttributes.pageSize = [scope.pageWidth, scope.pageHeight];
              scope.printAttributes.layout = undefined;
              scope.updatePrintPage();
            };

            scope.havePageSize = function() {
              return PrintPageService.isValidPageSize(scope.printAttributes.pageSize);
            };

            scope.isPrintable = function() {
              if(scope.prepareDownload === true) {
                return false;
              }
              if(scope.printAttributes.scale === undefined || scope.printAttributes.scale <= 0) {
                  return false;
              }
              if(scope.printAttributes.outputFormat === undefined) {
                return false;
              }
              if(!angular.equals(scope.isPrintableAttributes, {})) {
                var reject = false;
                angular.forEach(scope.isPrintableAttributes, function(value) {
                  if(reject) {
                    return;
                  }
                  reject = value !== true;
                });
                if(reject) {
                  return false;
                }
              }
              return scope.havePageSize();
            };
            scope.removePrintArea = function() {
              PrintPageService.removePrintArea();
              scope.printAttributes.layout = undefined;
              scope.printAttributes.pageSize = undefined;

            };
        },
        post: function(scope, element, attrs) {
          scope.$watchCollection('printAttributes.pageSize',
            function(n) {
              if(angular.isDefined(n)) {
                scope.printAttributes.pageSize = n;
                if(n[0] !== null) {
                  scope.pageWidth = Math.round(n[0]);
                }
                if(n[1] !== null) {
                  scope.pageHeight = Math.round(n[1]);
                }
              }
            }
          );
          scope.$watch('showPrintArea', function(n) {
            if(n === true) {
              scope.updatePrintPage();
            } else if (n === false) {
              scope.removePrintArea();
            }
          });
        }
      }
  };
}]);
;
angular.module('anol.print')
/**
 * @ngdoc object
 * @name anol.print.PrintServiceProvider
 */
.provider('PrintService', [function() {
    var _downloadReady, _printUrl, _checkUrlAttribute;
    var _downloadPrefix = '';
    var _preparePrintArgs = function(rawPrintArgs) {
        return rawPrintArgs;
    };
    var _mode = 'direct';
    /**
     * @ngdoc method
     * @name setPreparePrintArgs
     * @methodOf anol.print.PrintServiceProvider
     *
     * @param {function} preparePrintArgs Function returning argument dict send to print endpoint via post request
     * Function is called with the following parameters:
     * - **rawPrintArgs** - {Object} - Print args provided by anol.print.PrintDirective
     * - **rawPrintArgs.bbox** - {Array.<number>} - Bounding box to print
     * - **rawPrintArgs.layers** - {Array.<anol.layer>} - Layers to print
     * - **rawPrintArgs.projection** {string} - Projection code
     * - **rawPrintArgs.templateValues** {Object} - All values added to *printAttributes*. @see anol.print.PrintDirective
     *
     */
    this.setPreparePrintArgs = function(preparePrintArgs) {
        _preparePrintArgs = preparePrintArgs;
    };
    /**
     * @ngdoc method
     * @name setMode
     * @methodOf anol.print.PrintServiceProvider
     *
     * @param {string} mode Mode of print backend. Valid values are 'direct' and 'queue'. If using queue, *preparePrintArgs* and *downloadReady* functions must be defined.
     */
    this.setMode = function(mode) {
        _mode = mode;
    };
    /**
     * @ngdoc method
     * @name setCheckUrlAttribute
     * @methodOf anol.print.PrintServiceProvider

     * @param {string} checkUrlAttribute Attribute of print endpoint response containing the url for checking download ready when use queue mode.
     */
    this.setCheckUrlAttribute = function(checkUrlAttribute) {
        _checkUrlAttribute = checkUrlAttribute;
    };
    /**
     * @ngdoc method
     * @name downloadReady
     * @methodOf anol.print.PrintServiceProvider
     *
     * @param {function} downloadReady Function returning true if download is ready.
     * Function is called with the following parameters:
     * - **response** - {Object} - Response from check download request
     * Function must return valid download url or false
     */
    this.setDownloadReady = function(downloadReady) {
        _downloadReady = downloadReady;
    };
    /**
     * @ngdoc method
     * @name downloadPrefix
     * @ methodOf anol.print.PrintServiceProvider
     *
     * @param {string} downloadPrefix Filename of file to download will be prefixed with downloadPrefix
     */
    this.setDownloadPrefix = function(downloadPrefix) {
        _downloadPrefix = downloadPrefix;
    };
    /**
     * @ngdoc method
     * @name setPrintUrl
     * @methodOf anol.print.PrintServiceProvider
     *
     * @param {string} printUrl Url to print endpoint
     */
    this.setPrintUrl = function(printUrl) {
        _printUrl = printUrl;
    };

    this.$get = ['$q', '$http', '$timeout', function($q, $http, $timeout) {
        /**
         * @ngdoc service
         * @name anol.print.PrintService
         * @requires $q
         * @requires $http
         * @requires $timeout
         *
         * @description
         * Service for comunication with print backend
         */
        var Print = function(printUrl, mode, checkUrlAttribute, preparePrintArgs, downloadReady, downloadPrefix) {
            this.printUrl = printUrl;
            this.mode = mode;
            this.checkUrlAttribute = checkUrlAttribute;
            this.preparePrintArgs = preparePrintArgs;
            this.downloadReady = downloadReady;
            this.downloadPrefix = downloadPrefix;

            this.stopDownloadChecker = false;
        };
        /**
         * @ngdoc method
         * @name startPrint
         * @methodOf anol.print.PrintService
         *
         * @param {Object} rawPrintArgs Arguments provided by print directive
         * @param {Array.<number>} rawPrintArgs.bbox Print bounding box
         * @param {Array.<anol.layer>} rawPrintArgs.layers Anol layers to print
         * @param {string} rawPrintArgs.projection Output projection code
         *
         * @returns {Object} promise
         * @description
         * Requests the print endpoint and returns promise when resolved with downloadUrl
         */
        Print.prototype.startPrint = function(rawPrintArgs) {
            var printMode = this.mode;
            var printArgs = this.preparePrintArgs(rawPrintArgs);
            if('printMode' in printArgs) {
                printMode = printArgs.printMode;
                delete printArgs.printMode;
            }
            var downloadName = this.downloadPrefix;
            downloadName += new Date().getTime();
            downloadName += '.' + printArgs.fileEnding;
            printArgs.name = downloadName;
            switch(printMode) {
                case 'queue':
                    this.stopDownloadChecker = false;
                    return this.printQueue(printArgs);
                // includes case 'direct'
                default:
                    this.stopDownloadChecker = true;
                    return this.printDirect(printArgs);
            }
        };

        Print.prototype.printQueue = function(printArgs) {
            var self = this;
            var deferred = $q.defer();
            $http.post(this.printUrl, printArgs, {
                responseType: 'json'
            }).then(
                function(response) {
                    var checkUrl = response.data[self.checkUrlAttribute];
                    var checkPromise = self.checkDownload(checkUrl);
                    checkPromise.then(
                        function(downloadUrl) {
                            deferred.resolve({
                                'mode': 'queue',
                                'url': downloadUrl
                            });
                        },
                        function(reason) {
                            deferred.reject(reason);
                    });
                },
                function() {
                    deferred.reject();
                }
            );
            return deferred.promise;
        };

        Print.prototype.checkDownload = function(url) {
            var self = this;
            var deferred = $q.defer();

            var checker = function() {
                if(self.stopDownloadChecker) {
                    self.stopDownloadChecker = false;
                    // we pass true, so print-directive knows that
                    // download was replaced
                    deferred.reject('replaced');
                    return;
                }
                $http.get(url).then(
                    function(response) {
                        var downloadReady = self.downloadReady(response);
                        if(!downloadReady) {
                            $timeout(checker, 1000);
                            return;
                        }
                        deferred.resolve(downloadReady);
                    },
                    function() {
                        deferred.reject();
                    }
                );
            };
            checker();

            return deferred.promise;
        };

        Print.prototype.printDirect = function(printArgs) {
            var deferred = $q.defer();
            var filePromise = $http.post(this.printUrl, printArgs, {
                responseType: 'arraybuffer'
            });
            filePromise.then(
                function(response) {
                    var file = new Blob([response.data]);
                    var fileUrl = URL.createObjectURL(file);
                    deferred.resolve({
                        'mode': 'direct',
                        'url': fileUrl,
                        'name': printArgs.name
                    });
                },
                function() {
                    deferred.reject();
                }
            );
            return deferred.promise;
        };

        return new Print(_printUrl, _mode, _checkUrlAttribute, _preparePrintArgs, _downloadReady, _downloadPrefix);
    }];
}]);;
angular.module('anol.print')

/**
 * @ngdoc object
 * @name anol.print.PrintPageServiceProvider
 */
.provider('PrintPageService', [function() {
    // Better move directive configuration in directive so
    // direcitve can be replaced by custom one?
    var _pageLayouts, _outputFormats, _defaultScale, _style, _availableScales, _pageMargins, _minPageSize, _maxPageSize;
    var _allowPageResize = true;

    /**
     * @ngdoc method
     * @name setPageSizes
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Array.<Object>} pageLayouts List of page sizes.
     * Each page size is an object, containing the following elements
     * - **id** - {string} - Unique page size id
     * - **label** - {string} - Label of defined page size. Will be displayed in html
     * - **icon** - {string} - Icon of defined page size
     * - **mapSize** - {Array.<number>} - Height, width of map to print
     */
    this.setPageLayouts = function(pageLayouts) {
        _pageLayouts = pageLayouts;
    };
    /**
     * @ngdoc method
     * @name setOutputFormats
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Array.<Object>} outputFormats List of available output formats
     * Each output format is an object, containing the following elements
     * - **label** - {string} - Label of defined output format. Will be displayed in html
     * - **value** - {string} - File format ending
     */
    this.setOutputFormats = function(outputFormats) {
        _outputFormats = outputFormats;
    };
    /**
     * @ngdoc method
     * @name setDefaultScale
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {number} scale Initial scale
     */
    this.setDefaultScale = function(scale) {
        _defaultScale = scale;
    };
    /**
     * @ngdoc method
     * @name setAvailableScales
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Array.<number>} scales Available scales
     */
    this.setAvailableScales = function(scales) {
        _availableScales = scales;
    };
    /**
     * @ngdoc method
     * @name setStyle
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {Object} ol3 style object
     * @description
     * Define styling of print page feature displayed in map
     */
    this.setStyle = function(style) {
        _style = style;
    };
    /**
     * @ngdoc method
     * @name setPageResize
     * @methodOf anol.print.PrintPageServiceProvider
     * @param {boolean} allowed Allow / disallow page resize in map
     * @description
     * Allow / disallow page resize in map
     */
     this.setPageResize = function(allowed) {
        _allowPageResize = allowed;
     };

    this.setPageMargins = function(margins) {
        _pageMargins = margins || [0, 0, 0, 0];
    };

    this.setMinPageSize = function(size) {
        _minPageSize = size;
    };

    this.setMaxPageSize = function(size) {
        _maxPageSize = size;
    };

    this.$get = ['$rootScope', '$translate', 'MapService', 'LayersService', 'InteractionsService', function($rootScope, $translate, MapService, LayersService, InteractionsService) {
        /**
         * @ngdoc service
         * @name anol.print.PrintPageService
         * @requires $rootScope
         * @requires anol.map.MapService
         * @requires anol.map.LayersService
         * @requires anol.map.InteractionsService
         *
         * @description
         * Service for showing/hiding print area in map. It provides also the bbox of print area.
         */
        // var _modify;
        var _drag;
        var _printArea;
        var _cursorPointer;
        var _dragFeatures = {
            top: undefined,
            lefttop: undefined,
            left: undefined,
            leftbottom: undefined,
            bottom: undefined,
            rightbottom: undefined,
            right: undefined,
            righttop: undefined,
            center: undefined
        };
        var _modifyFeatures = new ol.Collection();

        var _printSource = new ol.source.Vector();
        // TODO use anol.layer.Feature
        var _printLayer = new ol.layer.Vector({
            source: _printSource,
            zIndex: 3
        });

        // TODO replace ol3 styling by anol.layerFeature styling
        if(_style) {
            _printLayer.setStyle(_style);
        }

        var layerOptions = {
            title: 'PrintLayer',
            displayInLayerswitcher: false,
            olLayer: _printLayer
        };

        LayersService.addSystemLayer(new anol.layer.Layer(layerOptions), 0);

        var CursorPointerInteraction = function(options) {
            ol.interaction.Pointer.call(this, {
                handleMoveEvent: CursorPointerInteraction.prototype.handleMoveEvent
            });
            this.cursor_ = 'pointer';
            this.previousCursor_ = undefined;

            this.features = options.features;
            this.layer = options.layer;
        };
        ol.inherits(CursorPointerInteraction, ol.interaction.Pointer);
        CursorPointerInteraction.prototype.handleMoveEvent = function(evt) {
            var self = this;
            if (self.cursor_) {
                var map = evt.map;
                var feature = map.forEachFeatureAtPixel(evt.pixel,
                    function(feature, layer) {
                        if(layer == self.layer && $.inArray(feature, self.faetures)) {
                            return feature;
                        }
                    });
                var element = evt.map.getTargetElement();
                if (feature) {
                  if (element.style.cursor != self.cursor_) {
                    self.previousCursor_ = element.style.cursor;
                    element.style.cursor = self.cursor_;
                  }
                } else if (self.previousCursor_ !== undefined) {
                  element.style.cursor = self.previousCursor_;
                  self.previousCursor_ = undefined;
                }
            }
        };

        var DragPrintPageInteraction = function(options) {
            ol.interaction.Pointer.call(this, {
                handleDownEvent: DragPrintPageInteraction.prototype.handleDownEvent,
                handleDragEvent: DragPrintPageInteraction.prototype.handleDragEvent,
                handleUpEvent: DragPrintPageInteraction.prototype.handleUpEvent
            });

            this.coordinate_ = null;
            this.feature_ = null;

            this.dragCallback = options.dragCallback;
            this.pageFeature = options.pageFeature;
            this.pageLayer = options.pageLayer;
        };
        ol.inherits(DragPrintPageInteraction, ol.interaction.Pointer);
        DragPrintPageInteraction.prototype.handleDownEvent = function(evt) {
            var self = this;
            var map = evt.map;
            var features = [];
            map.forEachFeatureAtPixel(evt.pixel,
                function(feature, layer) {
                    if(layer !== self.pageLayer) {
                        return;
                    }
                    features.push(feature);
                });

            if (features.length === 1 && features[0] === self.pageFeature) {
                this.coordinate_ = evt.coordinate;
                this.feature_ = self.pageFeature;
                return true;
            }

            return false;
        };
        DragPrintPageInteraction.prototype.handleDragEvent = function(evt) {
            var deltaX = evt.coordinate[0] - this.coordinate_[0];
            var deltaY = evt.coordinate[1] - this.coordinate_[1];
            var geometry = this.feature_.getGeometry();
            geometry.translate(deltaX, deltaY);
            this.coordinate_[0] = evt.coordinate[0];
            this.coordinate_[1] = evt.coordinate[1];
            if(this.dragCallback !== undefined) {
                this.dragCallback();
            }
        };
        DragPrintPageInteraction.prototype.handleUpEvent = function(evt) {
            this.coordinate_ = null;
            this.feature_ = null;
            return false;
        };

        /**
         * @ngdoc service
         * @name anol.print.PrintPageService
         *
         * @requires $rootScope
         * @requires MapService
         * @requires LayersService
         * @requires InteractionsService
         *
         * @description
         * Provides a rectabgular ol geometry representing a paper size.
         * Geometry can be moved or resized. With a given scale, the needed
         * paper size for selected area is calculated.
         *
         */
        var PrintPage = function(pageLayouts, outputFormats, defaultScale, availableScales, allowPageResize, pageMargins, minPageSize, maxPageSize) {
            this.pageLayouts = pageLayouts;
            this.outputFormats = outputFormats;
            this.defaultScale = defaultScale;
            this.availableScales = availableScales;
            this.allowPageResize = allowPageResize;
            this.currentPageSize = undefined;
            this.currentScale = undefined;
            this.pageMargins = pageMargins;
            this.minPageSize = minPageSize;
            this.maxPageSize = maxPageSize;

            var self = this;

            var translate = function() {
                $translate('anol.print.INVALID_WIDTH').then(
                    function(translation) {
                    self.invalidWidthText = translation;
                });
                $translate('anol.print.INVALID_HEIGHT').then(
                    function(translation) {
                    self.invalidHeightText = translation;
                });
                $translate('anol.print.WIDTH_REQUIRED').then(
                    function(translation) {
                    self.requiredWidthText = translation;
                });
                $translate('anol.print.HEIGHT_REQUIRED').then(
                    function(translation) {
                    self.requiredHeightText = translation;
                });
                $translate('anol.print.WIDTH_TOO_SMALL').then(
                    function(translation) {
                    self.widthTooSmallText = translation;
                });
                $translate('anol.print.HEIGHT_TOO_SMALL').then(
                    function(translation) {
                    self.heightTooSmallText = translation;
                });
                $translate('anol.print.WIDTH_TOO_BIG').then(
                    function(translation) {
                    self.widthTooBigText = translation;
                });
                $translate('anol.print.HEIGHT_TOO_BIG').then(
                    function(translation) {
                    self.heightTooBigText = translation;
                });
            };
            $rootScope.$on('$translateChangeSuccess', translate);
            translate();
        };
        /**
         * @ngdoc method
         * @name createPrintArea
         * @methodOf anol.print.PrintPageService
         *
         * @param {Array.<number>} pageSize Width, height of page in mm
         * @param {number} scale Map scale in printed output
         * @param {Array.<number>} center Center of print page. optional
         *
         * @description
         * Creates the print area geometry visible in map
         */
        PrintPage.prototype.createPrintArea = function(pageSize, scale) {
            var width = pageSize[0] - this.pageMargins[1] - this.pageMargins[3];
            var height = pageSize[1] - this.pageMargins[0] - this.pageMargins[2];
            this.currentPageSize = [width, height];
            this.currentScale = scale;
            this.mapWidth = this.currentPageSize[0] / 1000 * this.currentScale;
            this.mapHeight = this.currentPageSize[1] / 1000 * this.currentScale;

            var view = MapService.getMap().getView();
            var center = view.getCenter();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);

            _printSource.clear();
            _printArea = undefined;
            this.updatePrintArea(left, top, right, bottom);
            if(this.allowPageResize) {
                this.createDragFeatures(left, top, right, bottom, center);
            }
            this.createInteractions();
        };
        /**
         * @ngdoc method
         * @name removePrintArea
         * @methodOf anol.print.PrintPageService
         *
         * @description
         * Removes print area and all resize geometries
         */
        PrintPage.prototype.removePrintArea = function() {
            _printSource.clear();
            _printArea = undefined;
        };
        /**
         * @private
         * @name createDragFeatures
         * @methodOf anol.print.PrintPageService
         *
         * @param {number} left left coordinate
         * @prarm {number} top top coordinate
         * @param {number} right right coordinate
         * @param {number} bottom bottom coordinate
         * @param {Array.<number>} center center coordinates
         *
         * @description
         * Creates draggable points to modify print area
         */
        PrintPage.prototype.createDragFeatures = function(left, top, right, bottom, center) {
            var self = this;
            _modifyFeatures.clear();

            _dragFeatures.left = new ol.Feature(new ol.geom.Point([left, center[1]]));
            _dragFeatures.left.set('position', 'left');
            _dragFeatures.left.on('change', self.dragFeatureNormalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.left);

            _dragFeatures.right = new ol.Feature(new ol.geom.Point([right, center[1]]));
            _dragFeatures.right.set('position', 'right');
            _dragFeatures.right.on('change', self.dragFeatureNormalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.right);

            _dragFeatures.top = new ol.Feature(new ol.geom.Point([center[0], top]));
            _dragFeatures.top.set('position', 'top');
            _dragFeatures.top.on('change', self.dragFeatureNormalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.top);

            _dragFeatures.bottom = new ol.Feature(new ol.geom.Point([center[0], bottom]));
            _dragFeatures.bottom.set('position', 'bottom');
            _dragFeatures.bottom.on('change', self.dragFeatureNormalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.bottom);

            _dragFeatures.leftbottom = new ol.Feature(new ol.geom.Point([left, bottom]));
            _dragFeatures.leftbottom.set('position', 'leftbottom');
            _dragFeatures.leftbottom.on('change', self.dragFeatureDiagonalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.leftbottom);

            _dragFeatures.lefttop = new ol.Feature(new ol.geom.Point([left, top]));
            _dragFeatures.lefttop.set('position', 'lefttop');
            _dragFeatures.lefttop.on('change', self.dragFeatureDiagonalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.lefttop);

            _dragFeatures.rightbottom = new ol.Feature(new ol.geom.Point([right, bottom]));
            _dragFeatures.rightbottom.set('position', 'rightbottom');
            _dragFeatures.rightbottom.on('change', self.dragFeatureDiagonalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.rightbottom);

            _dragFeatures.righttop = new ol.Feature(new ol.geom.Point([right, top]));
            _dragFeatures.righttop.set('position', 'righttop');
            _dragFeatures.righttop.on('change', self.dragFeatureDiagonalChangeHandler, self);
            _modifyFeatures.push(_dragFeatures.righttop);

            _printSource.addFeatures(_modifyFeatures.getArray());
        };

        PrintPage.prototype.createInteractions = function() {
            var self = this;
            // if(_modify !== undefined) {
            //     InteractionsService.removeInteraction(_modify);
            // }
            if(_drag !== undefined) {
                InteractionsService.removeInteraction(_drag);
            }
            if(_cursorPointer !== undefined) {
                InteractionsService.removeInteraction(_cursorPointer);
            }
            // var modifyFeatures = new ol.Collection();
            // modifyFeatures.extend(_modifyFeatures);
            // modifyFeatures.push(_printArea);
            // var modifyOptions = {
            //     features: modifyFeatures,
            //     deleteCondition: function() {
            //         return false;
            //     }
            // };

            // if(_style !== undefined) {
            //     modifyOptions.style = _style;
            // }
            // _modify = new ol.interaction.Modify(modifyOptions);
            // _modify.on('modifyend', function() {
            //     self.updateDragFeatures();
            // });

            _drag = new DragPrintPageInteraction({
                dragCallback: function() {
                    self.updateDragFeatures();
                },
                pageFeature: _printArea,
                pageLayer: _printLayer
            });
            _cursorPointer = new CursorPointerInteraction({
                features: _modifyFeatures.getArray().concat(_printArea),
                layer: _printLayer
            });

            // InteractionsService.addInteraction(_modify);
            InteractionsService.addInteraction(_drag);
            InteractionsService.addInteraction(_cursorPointer);
        };
        /**
         * @private
         * @name updateDragFeatures
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Update draggable points after one points (currentFeature) was dragged
         */
        PrintPage.prototype.updateDragFeatures = function(currentFeature) {
            var self = this;
            // no need for update drag features if page cannot be resized in map
            if(!self.allowPageResize) {
                return;
            }
            var edgePoints = _printArea.getGeometry().getCoordinates()[0];
            var left = edgePoints[0][0];
            var right = edgePoints[1][0];
            var top = edgePoints[0][1];
            var bottom = edgePoints[2][1];
            var center = _printArea.getGeometry().getInteriorPoint().getCoordinates();

            var updateFeature = function(dragFeature, currentFeature, coords, handler) {
                // TODO remove modify when we can
                dragFeature.un('change', handler, self);
                if(dragFeature !== currentFeature) {
                    _modifyFeatures.remove(dragFeature);
                    dragFeature.getGeometry().setCoordinates(coords);
                    _modifyFeatures.push(dragFeature);
                }

                dragFeature.on('change', handler, self);
            };

            updateFeature(_dragFeatures.left, currentFeature, [left, center[1]], self.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.bottom, currentFeature, [center[0], bottom], self.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.right, currentFeature, [right, center[1]], self.dragFeatureNormalChangeHandler);
            updateFeature(_dragFeatures.top, currentFeature, [center[0], top], self.dragFeatureNormalChangeHandler);

            updateFeature(_dragFeatures.leftbottom, currentFeature, [left, bottom], self.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.rightbottom, currentFeature, [right, bottom], self.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.righttop, currentFeature, [right, top], self.dragFeatureDiagonalChangeHandler);
            updateFeature(_dragFeatures.lefttop, currentFeature, [left, top], self.dragFeatureDiagonalChangeHandler);
        };

        /**
         * @private
         * @name dragFeatureNormalChangeHandler
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} evt ol3 event
         *
         * @description
         * Perfroms actions for horizontal or vertical dragging
         */
        PrintPage.prototype.dragFeatureNormalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaNormal();
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };

        /**
         * @private
         * @name dragFeatureDiagonalChangeHandler
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} evt ol3 event
         *
         * @description
         * Perfroms actions for diagonal dragging
         */
        PrintPage.prototype.dragFeatureDiagonalChangeHandler = function(evt) {
            var currentFeature = evt.target;
            this.updatePrintAreaDiagonal(currentFeature);
            this.updateDragFeatures(currentFeature);
            this.updatePrintSize();
        };
        /**
         * @private
         * @name updatePrintAreaDiagonal
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after diagonal dragging
         */
        PrintPage.prototype.updatePrintAreaDiagonal = function(currentFeature) {
            var lefttop, righttop, leftbottom, rightbottom;
            if(_dragFeatures.lefttop === currentFeature || _dragFeatures.rightbottom === currentFeature) {
                lefttop = _dragFeatures.lefttop.getGeometry().getCoordinates();
                rightbottom = _dragFeatures.rightbottom.getGeometry().getCoordinates();
                this.updatePrintArea(lefttop[0], lefttop[1], rightbottom[0], rightbottom[1]);
            } else {
                righttop = _dragFeatures.righttop.getGeometry().getCoordinates();
                leftbottom = _dragFeatures.leftbottom.getGeometry().getCoordinates();
                this.updatePrintArea(leftbottom[0], righttop[1], righttop[0], leftbottom[1]);
            }
        };
        /**
         * @private
         * @name updatePrintAreaNormal
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after horizontal or vertical dragging
         */
        PrintPage.prototype.updatePrintAreaNormal = function() {
            var left = _dragFeatures.left.getGeometry().getCoordinates()[0];
            var right = _dragFeatures.right.getGeometry().getCoordinates()[0];
            var top = _dragFeatures.top.getGeometry().getCoordinates()[1];
            var bottom = _dragFeatures.bottom.getGeometry().getCoordinates()[1];

            this.updatePrintArea(left, top, right, bottom);
        };
        /**
         * @private
         * @name updatePrintAreaCenter
         * @methodOf anol.print.PrintPageService
         *
         * @param {Object} currentFeature dragged feature
         *
         * @description
         * Calculates print area bbox after center point was dragged
         */
        PrintPage.prototype.updatePrintAreaCenter = function(currentFeature) {
            var center = currentFeature.getGeometry().getCoordinates();
            var top = center[1] + (this.mapHeight / 2);
            var bottom = center[1] - (this.mapHeight / 2);
            var left = center[0] - (this.mapWidth / 2);
            var right = center[0] + (this.mapWidth / 2);
            this.updatePrintArea(left, top, right, bottom);
        };
        /**
         * @private
         * @name updatePrintArea
         * @methodOf anol.print.PrintPageService
         *
         * @param {number} left left coordinate
         * @param {number} top top coordinate
         * @param {number} right right coordinate
         * @param {number} bottom bottom coordinate
         *
         * @description
         * Updates print area geometry
         */
        PrintPage.prototype.updatePrintArea = function(left, top, right, bottom) {
            var coords = [[
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom],
                [left, top]
            ]];

            if(_printArea !== undefined) {
                _printArea.getGeometry().setCoordinates(coords);
            } else {
                _printArea = new ol.Feature(new ol.geom.Polygon(coords));
                _printSource.addFeatures([_printArea]);
            }
        };
        /**
         * @private
         * @name updatePrintSize
         * @methodOf anol.print.PrintPageService
         *
         * @description
         * Recalculate page size in mm
         */
        PrintPage.prototype.updatePrintSize = function() {
            var self = this;
            $rootScope.$apply(function() {
                self.mapWidth = _dragFeatures.right.getGeometry().getCoordinates()[0] - _dragFeatures.left.getGeometry().getCoordinates()[0];
                self.mapHeight = _dragFeatures.top.getGeometry().getCoordinates()[1] - _dragFeatures.bottom.getGeometry().getCoordinates()[1];
                self.currentPageSize = [
                    self.mapWidth * 1000 / self.currentScale,
                    self.mapHeight * 1000 / self.currentScale
                ];
            });
        };
        /**
         * @ngdoc method
         * @name addFeatureFromPageSize
         * @methodOf anol.print.PrintPageService
         *
         * @param {Array.<number>} pageSize Width, height of page in mm
         * @param {number} scale Map scale in printed output
         *
         * @description
         * Create or update print page geometry by given pageSize and scale
         */
        PrintPage.prototype.addFeatureFromPageSize = function(pageSize, scale) {
            if(!this.isValidPageSize(pageSize) || scale === undefined || isNaN(scale)) {
                return;
            }
            this.createPrintArea(pageSize, scale);
        };
        /**
         * @ngdoc method
         * @name getBounds
         * @methodOf anol.print.PrintPageService
         *
         * @returns {Array.<number>} Current bounds of area to print in map units
         *
         * @description
         * Returns the current print area bounds in map units
         */
        PrintPage.prototype.getBounds = function() {
            var bounds = [];
            bounds = _printArea.getGeometry().getExtent();
            return bounds;
        };
        /**
         * @ngdoc method
         * @name visible
         * @methodOf anol.print.PrintPageService
         *
         * @param {boolean} visibility Set page geometry visibility
         *
         * @description
         * Set visibility of print page geometry
         */
        PrintPage.prototype.visible = function(visibility) {
            _printLayer.setVisible(visibility);
        };

        PrintPage.prototype.validSize = function(size) {
            if(size === undefined) {
                return false;
            }
            if(isNaN(size)) {
                return false;
            }
            if(this.minPageSize !== undefined && size < this.minPageSize) {
                return false;
            }
            if(this.maxPageSize !== undefined && size > this.maxPageSize) {
                return false;
            }
            return true;
        };

        PrintPage.prototype.isValidPageSize = function(pageSize) {
            if(pageSize === undefined) {
                return false;
            }
            if(pageSize.length === 0) {
                return false;
            }
            if(!this.validSize(pageSize[0])) {
                return false;
            }
            if(!this.validSize(pageSize[1])) {
                return false;
            }
            return true;
        };

        PrintPage.prototype.mapToPageSize = function(mapSize) {
            var width = mapSize[0] + this.pageMargins[1] + this.pageMargins[3];
            var height = mapSize[1] + this.pageMargins[0] + this.pageMargins[2];
            return [width, height];
        };

        PrintPage.prototype.getSizeErrors = function(pageSize) {
            if(pageSize === undefined || pageSize.length === 0) {
                return {
                    'width': this.requiredWidthText,
                    'height': this.requiredHeightText
                };
            }

            var widthError;
            if(pageSize[0] === undefined || pageSize[0] === null ) {
                widthError = this.requiredWidthText;
            }
            if(widthError === undefined && isNaN(pageSize[0])) {
                widthError = this.invalidWidthText;
            }
            if(widthError === undefined && this.minPageSize !== undefined && pageSize[0] < this.minPageSize) {
                widthError = this.widthTooSmallText + Math.round(this.minPageSize) + 'mm';
            }
            if(widthError === undefined && this.maxPageSize !== undefined && pageSize[0] > this.maxPageSize) {
                widthError = this.widthTooBigText + Math.round(this.maxPageSize) + 'mm';
            }

            var heightError;
            if(pageSize[1] === undefined || pageSize[1] === null) {
                heightError = this.requiredHeightText;
            }
            if(heightError === undefined && isNaN(pageSize[1])) {
                heightError = this.invalidHeightText;
            }
            if(heightError === undefined && this.minPageSize !== undefined && pageSize[1] < this.minPageSize) {
                heightError = this.heightTooSmallText + Math.round(this.minPageSize) + 'mm';
            }
            if(heightError === undefined && this.maxPageSize !== undefined && pageSize[1] > this.maxPageSize) {
                heightError = this.heightTooBigText + Math.round(this.maxPageSize) + 'mm';
            }
            return {
                'width': widthError,
                'height': heightError
            };
        };

        return new PrintPage(_pageLayouts, _outputFormats, _defaultScale, _availableScales, _allowPageResize, _pageMargins, _minPageSize, _maxPageSize);
    }];
}]);
;
angular.module('anol.rotation')
/**
 * @ngdoc directive
 * @name anol.rotate.directive:anolRotation
 *
 * @requires $compile
 * @requires anol.map.ControlsService
 *
 * @param {string} tooltipPlacement Tooltip position
  * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip. Default 500ms
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 *
 * @description
 * Provides zoom buttons
 */
.directive('anolRotation', ['$compile', 'ControlsService',
    function($compile, ControlsService) {
    return {
        restrict: 'A',
        scope: {
            tooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@',
            ngStyle: '='
        },
        link: function(scope, element, attrs) {
            var olControl = new ol.control.Rotate();
            var control = new anol.control.Control({
                olControl: olControl
            });
            var controlElement = angular.element(olControl.element);
            controlElement.attr('ng-style', 'ngStyle');
            var rotateButton = controlElement.find('.ol-rotate-reset');
            rotateButton.removeAttr('title');
            rotateButton.attr('tooltip', '{{\'anol.rotate.TOOLTIP\' | translate }}');
            rotateButton.attr('tooltip-placement', scope.zoomInTooltipPlacement || 'right');
            rotateButton.attr('tooltip-append-to-body', true);
            rotateButton.attr('tooltip-popup-delay', scope.tooltipDelay || 500);
            rotateButton.attr('tooltip-enable', scope.tooltipEnable === undefined ? !ol.has.TOUCH : scope.tooltipEnable);
            rotateButton.attr('tooltip-trigger', 'mouseenter click');

            $compile(controlElement)(scope);

            ControlsService.addControl(control);
        }
    };
}]);
;
angular.module('anol.savemanager')

/**
 * @ngdoc directive
 * @name anol.savemanager.directive:anolSavemanager
 *
 * @restrict A
 * @requires anol.savemanager.SaveManagerService
 *
 * @param {string} templateUrl Url to template to use instead of default one
 *
 * @description
 * Provides save button for each saveable layer with changes
 */
.directive('anolSavemanager', ['SaveManagerService', function(SaveManagerService) {
    return {
        restrict: 'A',
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/savemanager/templates/savemanager.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        scope: {},

        link: function(scope, element, attrs) {
            scope.unsavedLayers = SaveManagerService.changedLayers;
            scope.changedFeatures = SaveManagerService.changedFeatures;

            scope.save = function(layer) {
                SaveManagerService.commit(layer).then(function() {
                    // TODO show success
                }, function() {
                    // TODO show or handle error
                });
            };
        }
    };
}]);;
angular.module('anol.savemanager')

/**
 * @ngdoc object
 * @name anol.savemanager.SaveManagerServiceProvider
 */
.provider('SaveManagerService', ['LayersServiceProvider', function(LayersServiceProvider) {
    // handles layer source change events and store listener keys for removing
    // listeners nicely
    var LayerListener = function(layer, saveManager) {
        this.layer = layer;
        this.saveManager = saveManager;
        this.source = layer.olLayer.getSource();

        this.addListenerKey = undefined;
        this.changeListenerKey = undefined;
        this.removeListenerKey = undefined;
    };
    LayerListener.prototype.register = function(addHandler, changeHandler, removeHandler) {
        var self = this;

        var _register = function(type, handler, key) {
            if(handler === undefined) {
                return;
            }
            if(key !== undefined) {
                self.source.unByKey(key);
            }
            return self.source.on(
                type,
                function(evt) {
                    handler.apply(self.saveManager, [evt, self.layer]);
                }
            );
        };

        self.addListenerKey = _register(
            'addfeature',
            addHandler,
            self.addListenerKey
        );
        self.changeListenerKey = _register(
            'changefeature',
            changeHandler,
            self.changeListenerKey
        );
        self.removeListenerKey = _register(
            'removefeature',
            removeHandler,
            self.removeListenerKey
        );
    };
    LayerListener.prototype.unregister = function() {
        var self = this;
        if(self.addListenerKey !== undefined) {
            self.source.unByKey(self.addListenerKey);
            self.addListenerKey = undefined;
        }
        if(self.changeListenerKey !== undefined) {
            self.source.unByKey(self.changeListenerKey);
            self.changeListenerKey = undefined;
        }
        if(self.removeListenerKey !== undefined) {
            self.source.unByKey(self.removeListenerKey);
            self.removeListenerKey = undefined;
        }
    };

    var _saveManagerInstance;
    var _saveUrl;
    var _saveableLayers = [];
    /**
     * @ngdoc method
     * @name setSaveUrl
     * @methodOf anol.savemanager.SaveManagerServiceProvider
     * @param {String} saveUrl url to save changes to. Might be overwritten by layer.saveUrl
     */
    this.setSaveUrl = function(saveUrl) {
        _saveUrl = saveUrl;
    };

    LayersServiceProvider.registerAddLayerHandler(function(layer) {
        if(layer.saveable !== true) {
            return;
        }
        if(_saveManagerInstance !== undefined) {
            _saveManagerInstance.addLayer(layer);
        } else {
            _saveableLayers.push(layer);
        }
    });

    this.$get = ['$rootScope', '$q', '$http', '$timeout', '$translate', function($rootScope, $q, $http, $timeout, $translate) {
        /**
         * @ngdoc service
         * @name anol.savemanager.SaveManagerService
         *
         * @description
         * Collects changes in saveable layers and send them to given saveUrl
         */
        var SaveManager = function(saveUrl, saveableLayers) {
            var self = this;
            this.saveUrl = saveUrl;
            this.changedLayers = {};
            this.changedFeatures = {};

            angular.forEach(saveableLayers, function(layer) {
                self.addLayer(layer);
            });

            var translate = function() {
                $translate('anol.savemanager.SERVICE_UNAVAILABLE').then(
                    function(translation) {
                    self.serviceUnavailableMessage = translation;
                });
            };
            $rootScope.$on('$translateChangeSuccess', translate);
            translate();
        };
        /**
         * @ngdoc method
         * @name addLayer
         * @methodOd anol.savemanager.SaveManagerService
         * @param {anol.layer.Feature} layer layer to watch for changes
         */
        SaveManager.prototype.addLayer = function(layer) {
            var self = this;
            var layerListener = new LayerListener(layer, self);
            $rootScope.$watch(function() {
                return layer.loaded;
            }, function(loaded) {
                if(loaded === true) {
                    layerListener.register(
                        self.featureAddedHandler,
                        self.featureChangedHandler,
                        self.featureRemovedHandler
                    );
                } else {
                    layerListener.unregister();
                }
            });
        };
        /**
         * private function
         *
         * handler for ol3 feature added event
         */
        SaveManager.prototype.featureAddedHandler = function(evt, layer) {
            var self = this;
            self.addChangedLayer(layer);
        };
        /**
         * private function
         *
         * handler for ol3 feature changed event
         */
        SaveManager.prototype.featureChangedHandler = function(evt, layer) {
            var self = this;
            self.addChangedLayer(layer);
        };
        /**
         * private function
         *
         * handler for ol3 feature removed event
         */
        SaveManager.prototype.featureRemovedHandler = function(evt, layer) {
            var self = this;
            self.addChangedLayer(layer);
        };
        /**
         * private function
         *
         * adds a layer to list of layers with changes
         */
        SaveManager.prototype.addChangedLayer = function(layer) {
            var self = this;
            if(!(layer.name in self.changedLayers)) {
                // TODO find out why $apply already in progress
                $timeout(function() {
                    $rootScope.$apply(function() {
                        self.changedLayers[layer.name] = layer;
                    });
                });
            }
        };
        /**
         * private function
         *
         * cleans up after changes done
         */
        SaveManager.prototype.changesDone = function(layerName) {
            delete this.changedLayers[layerName];
        };
        /**
         * @ngdoc method
         * @name commit
         * @methodOd anol.savemanager.SaveManagerService
         * @param {anol.layer.Feature} layer
         * @description
         * Commits changes for given layer
         */
        SaveManager.prototype.commit = function(layer) {
            var self = this;
            var deferred = $q.defer();
            var format = new ol.format.GeoJSON();

            if(layer.name in self.changedLayers) {
                var data = {
                    name: layer.name,
                    featureCollection: format.writeFeaturesObject(
                        layer.olLayer.getSource().getFeatures()
                    )
                };
                var promise = $http.post(self.saveUrl, data);
                promise.then(function(response) {
                    self.changesDone(layer.name);
                    deferred.resolve(response.data);
                }, function(response) {
                    if(response.status === -1) {
                        deferred.reject({'message': self.serviceUnavailableMessage});
                    } else {
                        deferred.reject(response.data);
                    }
                });
            } else {
                deferred.reject('No changes for layer ' + layer.name + ' present');
            }

            return deferred.promise;
        };
        /**
         * @ngdoc method
         * @name commitAll
         * @methodOf anol.savemanager.SaveManagerService
         *
         * @description
         * Commit all changed layers
         */
        SaveManager.prototype.commitAll = function() {
            var self = this;
            var promises = [];
            angular.forEach(self.changedLayers, function(layer) {
                promises.push(self.commit(layer));
            });
            return $q.all(promises);
        };
        _saveManagerInstance = new SaveManager(_saveUrl, _saveableLayers);
        return _saveManagerInstance;
    }];
}]);;
angular.module('anol.scale')

/**
 * @ngdoc directive
 * @name anol.scale.directive:anolScaleLine
 *
 * @requires anol.map.MapService
 * @requires anol.map.ControlsService
 *
 * @description
 * Add a ol scaleline to element directive is used in.
 * If element is defined inside anol-map-directive, scaleline is added to map
 */
.directive('anolScaleLine', ['MapService', 'ControlsService', function(MapService, ControlsService) {
    return {
        restrict: 'A',
        require: '^anolMap',
        replace: true,
        template: '<div class="anol-scale-line ol-unselectable"><div class="anol-scale-line-inner ol-control"></div></div>',
        scope: {},
        link: {
            post: function(scope, element, attrs) {
                scope.map = MapService.getMap();
                var anolScaleLineInner = element.find('.anol-scale-line-inner');
                var controlOptions = {
                    target: anolScaleLineInner[0]
                };
                var olControl = new ol.control.ScaleLine(controlOptions);
                // For placement reason we need a container control
                var containerControl = new anol.control.Control({
                    element: element
                });
                var scaleControl = new anol.control.Control({
                    olControl: olControl
                });
                ControlsService.addControl(containerControl);
                ControlsService.addControl(scaleControl);
            }
        }
    };
}]);
;
angular.module('anol.scale')

/**
 * @ngdoc function
 * @name anol.scale.function:calculateScale
 *
 * @param {Object} view ol.View object
 *
 * @returns {number} current scale
 */
.constant('calculateScale', function(view) {
    var INCHES_PER_METER = 1000 / 25.4;
    var DPI = 72;
    // found at https://groups.google.com/d/msg/ol3-dev/RAJa4locqaM/4AzBrkndL9AJ
    var resolution = view.getResolution();
    var mpu = view.getProjection().getMetersPerUnit();
    var scale = resolution * mpu * INCHES_PER_METER * DPI;
    return Math.round(scale);
})

/**
 * @ngdoc directive
 * @name anol.scale.directive:anolScaleText
 *
 * @requires $timeout
 * @requires anol.map.MapService
 * @requires anol.map.ControlsService
 * @requires anol.scale.calculateScale
 *
 * @description
 * Add scaletext to element directive is used in.
 * If element is defined inside anol-map-directive, scaletext is added to map
 */
.directive('anolScaleText', ['$timeout', 'MapService', 'ControlsService', 'calculateScale', function($timeout, MapService, ControlsService, calculateScale) {

    return {
        restrict: 'A',
        require: '?^anolMap',
        templateUrl: function(tElement, tAttrs) {
            var defaultUrl = 'src/modules/scale/templates/scaletext.html';
            return tAttrs.templateUrl || defaultUrl;
        },
        scope: {},
        link: {
            pre: function(scope, element, attrs, AnolMapController) {
                scope.view = MapService.getMap().getView();
                if(angular.isObject(AnolMapController)) {
                    element.addClass('ol-unselectable');
                    element.addClass('ol-control');
                    ControlsService.addControl(
                        new anol.control.Control({
                            element: element
                        })
                    );
                }

                scope.scale = calculateScale(scope.view);
            },
            post: function(scope, element, attrs) {
                scope.view.on('change:resolution', function() {
                    // used $timeout instead of $apply to avoid "$apply already in progress"-error
                    $timeout(function() {
                        scope.scale = calculateScale(scope.view);
                    }, 0, true);
                });

            }
        }
    };
}]);;
angular.module('anol.urlmarkers')

.directive('anolUrlMarkers', ['$compile', 'UrlMarkersService', 'MapService', function($compile, UrlMarkersService, MapService) {
    return function(scope) {
        if(!UrlMarkersService.usePopup) {
            return;
        }

        var overlays = [];

        var popupTemplate = '<div class="anol-popup top">' +
                            '<span class="anol-popup-closer glyphicon glyphicon-remove" ng-mousedown="$event.stopPropagation();"></span>' +
                            '<div class="anol-popup-content" bbcode>' +
                            '</div>' +
                            '</div>';

        angular.forEach(UrlMarkersService.features, function(feature) {
            if (feature.get('label')) {
                var overlayTemplate = angular.element(angular.copy(popupTemplate));
                overlayTemplate.find('.anol-popup-content').text(feature.get('label'));
                var overlayElement = $compile(overlayTemplate)(scope);
                var overlay = new ol.Overlay({
                    element: overlayElement[0],
                    autoPan: false
                });
                overlayElement.find('.anol-popup-closer').click(function() {
                    MapService.getMap().removeOverlay(overlay);
                });
                angular.element(overlay.getElement()).parent().addClass('anol-popup-container');
                MapService.getMap().addOverlay(overlay);
                overlay.setPosition(feature.getGeometry().getCoordinates());
                overlays.push(overlay);
            }
        });
    };
}]);
;
angular.module('anol.urlmarkers')
/**
 * @ngdoc object
 * @name anol.urlmarkers.UrlMarkersServiceProvider
 */
.provider('UrlMarkersService', [function() {
    var _defaultSrs;
    var _propertiesDelimiter = '|';
    var _keyValueDelimiter = ':';
    var _style = {};
    var _usePopup = true;
    var _popupOffset = [0, 0];

    /**
     * @ngdoc method
     * @name setDefaultSrs
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {string} srs default EPSG code of marker coordinates in url
     */
    this.setDefaultSrs = function(srs) {
        _defaultSrs = srs;
    };

    /**
     * @ngdoc method
     * @name setPropertiesDelimiter
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {string} delimiter Delimiter separating marker properties
     */
    this.setPropertiesDelimiter = function(delimiter) {
        _propertiesDelimiter = delimiter || _propertiesDelimiter;
    };

    /**
     * @ngdoc method
     * @name setKeyValueDelimiter
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {string} delimiter Delimiter separating properties keys from values
     */
    this.setKeyValueDelimiter = function(delimiter) {
        _keyValueDelimiter = delimiter || _keyValueDelimiter;
    };

    /**
     * @ngdoc method
     * @name setMarkerStyle
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {object} style marker style
     */
    this.setMarkerStyle = function(style) {
        _style = style;
    };

    /**
     * @ngdoc method
     * @name setPopup
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {boolean} usePopup
     * @description When not using popup a label text is added. This can be styled by markerStyle
     */
    this.setUsePopup = function(usePopup) {
        _usePopup = usePopup === undefined ? _usePopup : usePopup;
    };

    /**
     * @ngdoc method
     * @name setPopupOffset
     * @methodOf anol.urlmarkers.UrlMarkersServiceProvider
     * @param {Array.<number>} popupOffset Offset of placed popup. First value is x- second value is y-offset in px
     */
    this.setPopupOffset = function(popupOffset) {
        _popupOffset = popupOffset === undefined ? _popupOffset : popupOffset;
    };

    this.$get = ['$location', 'MapService', 'LayersService', function($location, MapService, LayersService) {
        /**
         * @ngdoc service
         * @name anol.urlmarkers.UrlMarkersService
         *
         * @description
         * Adds markers specified in url. A valid url marker looks like marker=color:ff0000|label:foobar|coord:8.21,53.15|srs:4326
         */
        var UrlMarkers = function(defaultSrs, propertiesDelimiter, keyValueDelimiter, style, usePopup, popupOffset) {
            var self = this;
            self.features = [];
            self.defaultSrs = defaultSrs || MapService.view.getProjection();
            self.propertiesDelimiter = propertiesDelimiter;
            self.keyValueDelimiter = keyValueDelimiter;
            self.style = style;
            self.usePopup = usePopup;
            self.popupOffset = popupOffset;

            self.extractFeaturesFromUrl();

            if(self.features.length === 0) {
                return;
            }

            self.layer = self.createLayer(self.features);

            LayersService.addSystemLayer(self.layer);
        };

        UrlMarkers.prototype.extractFeaturesFromUrl = function() {
            var self = this;
            var urlParams = $location.search();

            if(angular.isUndefined(urlParams.marker)) {
                return false;
            }

            var markers = angular.isArray(urlParams.marker) ? urlParams.marker : [urlParams.marker];
            angular.forEach(markers, function(_marker) {
                var params = _marker.split(self.propertiesDelimiter);
                if(params.length === 0) {
                    return;
                }

                var marker = {};
                var style = {};
                angular.forEach(params, function(kv) {
                    kv = kv.split(self.keyValueDelimiter);
                    if(kv[0] === 'coord') {
                        var coord = kv[1].split(',');
                        coord = [parseFloat(coord[0]), parseFloat(coord[1])];
                        marker.geometry = new ol.geom.Point(coord);
                    } else if (kv[0] === 'srs') {
                        marker.srs = 'EPSG:' + kv[1];
                    } else if (kv[0] === 'color') {
                        style = {
                            fillColor: '#' + kv[1],
                            strokeColor: '#' + kv[1],
                            graphicColor: '#' + kv[1]
                        };
                    } else {
                        marker[kv[0]] = kv[1];
                    }
                });
                if(marker.geometry === undefined) {
                    return;
                }
                marker.geometry.transform(
                    marker.srs || self.defaultSrs,
                    MapService.view.getProjection()
                );
                marker.style = angular.merge({}, self.style, style);
                if(!self.usePopup && marker.label !== undefined) {
                    marker.style.text = marker.label;
                }
                self.features.push(new ol.Feature(marker));

            });
        };

        UrlMarkers.prototype.createLayer = function(features) {
            var layer = new anol.layer.Feature({
                name: 'markersLayer',
                olLayer: {
                    source: {
                        features: features
                  }
                }
            });

            var olLayerOptions = layer.olLayerOptions;
            olLayerOptions.source = new layer.OL_SOURCE_CLASS(layer.olSourceOptions);
            layer.setOlLayer(new layer.OL_LAYER_CLASS(olLayerOptions));

            return layer;
        };

        return new UrlMarkers(_defaultSrs, _propertiesDelimiter, _keyValueDelimiter, _style, _usePopup, _popupOffset);
    }];
}]);
;
angular.module('anol.urlmarkers')
.directive('bbcode', [function() {
    var snippets = {
        'b': '<b>$1</b>',
        'u': '<u>$1</u>',
        'i': '<i>$1</i>'
    };

    return {
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                var contents = element.html().replace(/^\s+|\s+$/i, '');

                for(var i in snippets) {
                    var regexp = new RegExp('\\[' + i + '\\](.+?)\\[\/' + i.replace(/[^a-z]/g, '') + '\\]', 'gi');

                    contents = contents.replace(regexp, snippets[i]);
                }

                contents = contents.replace(new RegExp('\\[br\\]'), '<br>');

                element.html(contents);
            });
        }
    };
}]);
;
angular.module('anol.zoom')
/**
 * @ngdoc directive
 * @name anol.zoom.directive:anolZoom
 *
 * @requires $compile
 * @requires anol.map.ControlsService
 *
 * @param {string} zoomInTooltipPlacement Tooltip position for zoom in button
 * @param {string} zoomOutTooltipPlacement Tooltip position for zoom out button
 * @param {number} tooltipDelay Time in milisecounds to wait before display tooltip. Default 500ms
 * @param {boolean} tooltipEnable Enable tooltips. Default true for non-touch screens, default false for touchscreens
 *
 * @description
 * Provides zoom buttons
 */
.directive('anolZoom', ['$compile', 'ControlsService',
    function($compile, ControlsService) {
    return {
        restrict: 'A',
        scope: {
            zoomOutTooltipText: '@',
            zoomOutTooltipPlacement: '@',
            tooltipDelay: '@',
            tooltipEnable: '@',
            ngStyle: '='
        },
        link: function(scope, element, attrs) {
            var olControl = new ol.control.Zoom({
                zoomInLabel: document.createTextNode(''),
                zoomOutLabel: document.createTextNode('')
            });
            var control = new anol.control.Control({
                olControl: olControl
            });

            var olControlElement = angular.element(olControl.element);

            var zoomInButton = olControlElement.find('.ol-zoom-in');
            zoomInButton.removeAttr('title');
            zoomInButton.attr('tooltip', '{{\'anol.zoom.TOOLTIP_ZOOM_IN\' | translate }}');
            zoomInButton.attr('tooltip-placement', scope.zoomInTooltipPlacement || 'right');
            zoomInButton.attr('tooltip-append-to-body', true);
            zoomInButton.attr('tooltip-popup-delay', scope.tooltipDelay || 500);
            zoomInButton.attr('tooltip-enable', scope.tooltipEnable === undefined ? !ol.has.TOUCH : scope.tooltipEnable);
            zoomInButton.attr('tooltip-trigger', 'mouseenter click');
            zoomInButton.removeClass('ol-zoom-in');
            zoomInButton.append(angular.element('<span class="glyphicon glyphicon-plus"></span>'));

            var zoomOutButton = olControlElement.find('.ol-zoom-out');
            zoomOutButton.removeAttr('title');
            zoomOutButton.attr('tooltip', '{{\'anol.zoom.TOOLTIP_ZOOM_OUT\' | translate }}');
            zoomOutButton.attr('tooltip-placement', scope.zoomOutTooltipPlacement || 'right');
            zoomOutButton.attr('tooltip-append-to-body', true);
            zoomOutButton.attr('tooltip-popup-delay', scope.tooltipDelay || 500);
            zoomOutButton.attr('tooltip-enable', scope.tooltipEnable === undefined ? !ol.has.TOUCH : scope.tooltipEnable);
            zoomOutButton.attr('tooltip-trigger', 'mouseenter click');
            zoomOutButton.removeClass('ol-zoom-out');
            zoomOutButton.append(angular.element('<span class="glyphicon glyphicon-minus"></span>'));

            olControlElement.attr('ng-style', 'ngStyle');
            $compile(olControlElement)(scope);

            ControlsService.addControl(control);
        }
    };
}]);
