angular.module('munimap', [
    'anol.map',
    'anol.zoom',
    'anol.print',
    'anol.getfeatureinfo',
    'anol.geolocation',
    'anol.measure'
])

    .config(['PrintServiceProvider', 'PrintPageServiceProvider', 'munimapConfig',
        function(PrintServiceProvider, PrintPageServiceProvider, munimapConfig) {
            return false;
        }]);


