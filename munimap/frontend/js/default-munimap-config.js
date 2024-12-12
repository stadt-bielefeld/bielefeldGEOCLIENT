import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
window.defaultMunimapConfig = {
    printConfig: {
        mode: 'queue',
        downloadPrefix: 'munimap-',
        printUrl: '',
        checkUrl: 'statusURL',
        cells: [5, 5],
        chooseStreetIndex: false,
        chooseCells: false,
        pageResize: false,
        defaultScale: 2500,
        availableScales: [
            1250,
            2500,
            5000,
            10000
        ],
        availablePageLayouts: {},
        pageLayouts: [],
        outputFormats: [
            {
                'label': 'PDF',
                'value': 'pdf',
                'fileEnding': 'pdf',
                'mimetype': 'application/pdf'
            },
            {
                'label': 'PNG',
                'value': 'png',
                'fileEnding': 'png',
                'mimetype': 'image/png'
            }
        ],
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.4)'
            }),
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 1)',
                width: 1
            }),
            image: new CircleStyle({
                radius: 5,
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 1)'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 1)',
                    width: 1
                })
            })
        })
    },
    searchConfig: {
        geocoder: 'Nominatim',
        resultMarkerVisible: 5000,
        resultMarker: {
            graphicFile: 'geocoder-marker.svg',
            graphicWidth: 32,
            graphicHeight: 50,
            graphicYAnchor: 50,
            graphicScale: 0.75
        }
    },
    geolocationConfig: {
        resultVisible: 5000,
        tracking: false,
        style: {
            graphicFile: 'geocoder-marker.svg',
            graphicWidth: 32,
            graphicHeight: 50,
            graphicYAnchor: 50,
            graphicScale: 0.75
        }
    },
    app: {
        tooltipDelay: 1000,
        preferredLanguage: 'de_DE',
        sidebarOpen: false,
        versionString: ''
    },
    map: {
        projection: 'EPSG:3857',
        center: [
            8.2175,
            53.1512
        ],
        centerProjection: 'EPSG:4326',
        zoom: 14
    },
    components: {
        search: true,
        geolocation: true,
        layerswitcher: true,
        overviewmap: true,
        homeButton: true,
        menuButton: true
    }
};
