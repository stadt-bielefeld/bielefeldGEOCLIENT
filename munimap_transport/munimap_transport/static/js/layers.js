import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

angular.module('munimapBase').config(['LayersServiceProvider', 'stationLayerURL', 'stationPointLayerURL', 'munimapConfig',
    function(LayersServiceProvider, stationLayerURL, stationPointLayerURL, munimapConfig) {

     if (!munimapConfig.components.timetable) {
         return;
     }

    var stationLayer = new anol.layer.BBOXGeoJSON({
        name: 'selectable_stations',
        displayInLayerswitcher: false,
        minResolution: 3, 
        maxResolution: 20,
        featureinfo: {
            properties: ['name', 'city', 'routes']
        },
        olLayer: {
            minResolution: 3, 
            maxResolution: 20,
            style: [],   
            source: {
                featureProjection: 'EPSG:25832',
                extentProjection: 'EPSG:4326',
                dataProjection: 'EPSG:3857',
                url: stationLayerURL
            }
        }
    });
    LayersServiceProvider.setLayers(stationLayer);

    var stationPointLayer = new anol.layer.BBOXGeoJSON({
        name: 'selectable_station_points',
        displayInLayerswitcher: false,
        featureinfo: {
            properties: ['name', 'city', 'routes']
        },
        maxResolution: 2.4,
        olLayer: {
            maxResolution: 2.4,
            style: [],         
            source: {
                featureProjection: 'EPSG:25832',
                extentProjection: 'EPSG:4326',
                dataProjection: 'EPSG:3857',
                url: stationPointLayerURL
            }
        }
    });
    LayersServiceProvider.setLayers(stationPointLayer);

    var routeLayer = new anol.layer.StaticGeoJSON({
        name: 'display_routes',
        displayInLayerswitcher: false,
        olLayer: {
           style: function(feature, resolution) {
               if (feature !== undefined) {
                   var properties = feature.getProperties();
                   var style = loadRouteStyle(properties['type'], resolution);
                   return [style];
               }
            },
            source: {
                featureProjection: 'EPSG:25832',
                dataProjection: 'EPSG:3857'
            }
        }
    });
    LayersServiceProvider.setLayers(routeLayer);
}]);

function loadRouteStyle(type, resolution) {
    var strokeWidth = 16;
    if (resolution <= 1) {
        strokeWidth = 22;
    }

    var color = 'rgba(156, 156, 155, 0.5)';
    switch (type) {
    case 'bus':
        color = 'rgba(229, 38, 41, 0.25)';
        break;
    case 'light_rail':
        color = 'rgba(0, 159, 189, 0.25)';
        break;
    case 'tram':
        color = 'rgba(0, 159, 189, 0.25)';
        break;
    case 'railway':
    case 'train':
    default:
        'rgba(156, 156, 155, 0.5)';
        break;
    }

    return new Style({
        stroke: new Stroke({
            color: color,
            width: strokeWidth
        })
    });
}


