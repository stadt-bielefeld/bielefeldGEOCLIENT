describe('Default config test', function() {
    var $scope, $rootScope, $controller;

    beforeEach(function() {
        module('munimapBase');
        munimapBootstrap({});
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
        });
        inject(function(_$controller_) {
            $controller = _$controller_;
        });
    });

    afterEach(function() {
        $rootScope.$destroy();
        $(document).data('$injector', '');
        // hack for removing munimapConfig constant,
        // so next app can setup propperly with custom app config
        delete angular.module('munimapBase')._invokeQueue[0][2];
    });

    it('should be applied correct to scope', function() {
        $controller('baseController', {$scope: $scope});

        // base settings
        expect($scope.tooltipDelay).toBe(1000);
        expect($scope.headerLogoURL).toBe('/static/img/logo.png');
        expect($scope.versionString).toBe('');
        expect($scope.sidebar.open).toBe(false);


        // enabled components
        expect($scope.printEnabled).toBe(false);
        expect($scope.searchEnabled).toBe(true);
        expect($scope.legendEnabled).toBe(false);
        expect($scope.layerswitcherEnabled).toBe(true);
        expect($scope.geolocationEnabled).toBe(true);
        expect($scope.scaleLineEnabled).toBe(false);
        expect($scope.scaleTextEnabled).toBe(false);

        // print config
        expect($scope.printConfig.mode).toBe('queue');
        expect($scope.printConfig.downloadPrefix).toBe('munimap-');
        expect($scope.printConfig.printUrl).toBe('');
        expect($scope.printConfig.checkUrl).toBe('statusURL');
        expect($scope.printConfig.cells).toEqual([5, 5]);
        expect($scope.printConfig.chooseStreetIndex).toBe(false);
        expect($scope.printConfig.chooseCells).toBe(false);
        expect($scope.printConfig.pageResize).toBe(false);
        expect($scope.printConfig.defaultScale).toBe(2500);
        expect($scope.printConfig.availableScales).toEqual([
            1250,
            2500,
            5000,
            10000
        ]);
        expect($scope.printConfig.availablePageLayouts).toEqual({});
        expect($scope.printConfig.pageLayouts).toEqual([]);
        expect($scope.printConfig.outputFormats).toEqual([
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
        ]);
        expect($scope.printConfig.style.getFill().getColor()).toBe('rgba(255, 255, 255, 0.4)');
        expect($scope.printConfig.style.getStroke().getColor()).toBe('rgba(0, 0, 0, 1)');
        expect($scope.printConfig.style.getStroke().getWidth()).toBe(1);
        expect($scope.printConfig.style.getImage().getRadius()).toBe(5);
        expect($scope.printConfig.style.getImage().getFill().getColor()).toBe('rgba(255, 255, 255, 1)');
        expect($scope.printConfig.style.getImage().getStroke().getColor()).toBe('rgba(0, 0, 0, 1)');
        expect($scope.printConfig.style.getImage().getStroke().getWidth()).toBe(1);

        // search config
        expect($scope.searchConfig).toEqual({
            geocoder: 'Nominatim',
            resultMarkerVisible: 5000,
            resultMarker: {
                  graphicFile: 'geocoder-marker.svg',
                  graphicWidth: 32,
                  graphicHeight: 50,
                  graphicYAnchor: 50,
                  graphicScale: 0.75
            }
        });

        // geolocation config
        expect($scope.geolocationConfig).toEqual({
            resultVisible: 5000,
            tracking: false,
            style: {
                graphicFile: 'geocoder-marker.svg',
                graphicWidth: 32,
                graphicHeight: 50,
                graphicYAnchor: 50,
                graphicScale: 0.75
            }
        });
    });

    it('should be applied correct to map', inject(function(MapService) {
        var expectedCenter = ol.proj.transform([8.2175, 53.1512], 'EPSG:4326', 'EPSG:3857');
        var view = MapService.getMap().getView();
        expect(view.getZoom()).toBe(14);
        expect(view.getCenter()).toEqual(expectedCenter);
        expect(view.getProjection().getCode()).toBe('EPSG:3857');
    }));
});

describe('App config test', function() {
    var $scope, $rootScope, $controller;

    beforeEach(function() {
        module('munimapBase');
        munimapBootstrap({
            app: {
                tooltipDelay: 2000,
                headerLogo: '/foo/bar.png',
                versionString: 'v0.1'
            },
            map: {
                projection: 'EPSG:4326',
                center: [10.925, 48.119],
                centerProjection: 'EPSG:4326',
                zoom: 10
            },
            components: {
                search: false,
                print: true,
                geolocation: false
            },
            printConfig: {
                chooseCells: true,
                chooseStreetIndex: true,
                downloadPrefix: 'foobar-',
                availableScales: [500, 1000, 2500, 5000, 10000, 15000],
                availablePageLayouts: {
                    'a4-portrait': {
                        label: 'A4',
                        icon: 'glyphicon-resize-vertical',
                        mapElementSize: [555, 780]
                    },
                    'a4-landscape': {
                        label: 'A4',
                        icon: 'glyphicon-resize-horizontal',
                        mapElementSize: [802, 531]
                    }
                },
                pageLayouts: ['a4-portrait', 'a4-landscape']
            },
            searchConfig: {
                resultMarkerVisible: 0
            },
            geolocationConfig: {
                tracking: true,
                style: {
                    graphicFile: 'foobar.svg'
                }
            }
        });
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
        });
        inject(function(_$controller_) {
            $controller = _$controller_;
        });
    });

    afterEach(function() {
        $rootScope.$destroy();
        $(document).data('$injector', '');
        // hack for removing munimapConfig constant,
        // so next app can setup propperly with custom app config
        delete angular.module('munimapBase')._invokeQueue[0][2];
    });

    it('should be applied correct to scope', function() {
        $controller('baseController', {$scope: $scope});

        // base settings
        expect($scope.tooltipDelay).toBe(2000);
        expect($scope.headerLogoURL).toBe('/foo/bar.png');
        expect($scope.versionString).toBe('v0.1');
        expect($scope.sidebar.open).toBe(false);


        // enabled components
        expect($scope.printEnabled).toBe(true);
        expect($scope.searchEnabled).toBe(false);
        expect($scope.legendEnabled).toBe(false);
        expect($scope.layerswitcherEnabled).toBe(true);
        expect($scope.geolocationEnabled).toBe(false);
        expect($scope.scaleLineEnabled).toBe(false);
        expect($scope.scaleTextEnabled).toBe(false);

        // print config
        expect($scope.printConfig.mode).toBe('queue');
        expect($scope.printConfig.downloadPrefix).toBe('foobar-');
        expect($scope.printConfig.printUrl).toBe('');
        expect($scope.printConfig.checkUrl).toBe('statusURL');
        expect($scope.printConfig.cells).toEqual([5, 5]);
        expect($scope.printConfig.chooseStreetIndex).toBe(true);
        expect($scope.printConfig.chooseCells).toBe(true);
        expect($scope.printConfig.pageResize).toBe(false);
        expect($scope.printConfig.defaultScale).toBe(2500);
        expect($scope.printConfig.availableScales).toEqual([
            500,
            1000,
            2500,
            5000,
            10000,
            15000
        ]);
        expect($scope.printConfig.availablePageLayouts).toEqual({
            'a4-portrait': {
                label: 'A4',
                icon: 'glyphicon-resize-vertical',
                // transformed from px to mm while applying config
                // also renamed from mapElementSize to mapSize
                mapSize: [
                    555 / 72 * 25.4,
                    780 / 72 * 25.4
                ],
                // add during applying config
                layout: 'a4-portrait'
            },
            'a4-landscape': {
                label: 'A4',
                icon: 'glyphicon-resize-horizontal',
                // transformed from px to mm while applying config
                // also renamed from mapElementSize to mapSize
                mapSize: [
                    802 / 72 * 25.4,
                    531 / 72 * 25.4
                ],
                // add during applying config
                layout: 'a4-landscape'
            }
        });
        expect($scope.printConfig.pageLayouts).toEqual(['a4-portrait', 'a4-landscape']);
        expect($scope.printConfig.outputFormats).toEqual([
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
        ]);
        expect($scope.printConfig.style.getFill().getColor()).toBe('rgba(255, 255, 255, 0.4)');
        expect($scope.printConfig.style.getStroke().getColor()).toBe('rgba(0, 0, 0, 1)');
        expect($scope.printConfig.style.getStroke().getWidth()).toBe(1);
        expect($scope.printConfig.style.getImage().getRadius()).toBe(5);
        expect($scope.printConfig.style.getImage().getFill().getColor()).toBe('rgba(255, 255, 255, 1)');
        expect($scope.printConfig.style.getImage().getStroke().getColor()).toBe('rgba(0, 0, 0, 1)');
        expect($scope.printConfig.style.getImage().getStroke().getWidth()).toBe(1);

        // search config
        expect($scope.searchConfig).toEqual({
            geocoder: 'Nominatim',
            resultMarkerVisible: 0,
            resultMarker: {
                  graphicFile: 'geocoder-marker.svg',
                  graphicWidth: 32,
                  graphicHeight: 50,
                  graphicYAnchor: 50,
                  graphicScale: 0.75
            }
        });

        // geolocation config
        expect($scope.geolocationConfig).toEqual({
            resultVisible: 5000,
            tracking: true,
            style: {
                graphicFile: 'foobar.svg',
                graphicWidth: 32,
                graphicHeight: 50,
                graphicYAnchor: 50,
                graphicScale: 0.75
            }
        });
    });

    it('should be applied correct to map', inject(function(MapService) {
        var expectedCenter = [10.925, 48.119];
        var view = MapService.getMap().getView();
        expect(view.getZoom()).toBe(10);
        expect(view.getCenter()).toEqual(expectedCenter);
        expect(view.getProjection().getCode()).toBe('EPSG:4326');
    }));
});