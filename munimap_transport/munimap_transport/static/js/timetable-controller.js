angular.module('munimapBase')
    .controller('TimetableController', ['$scope', 'TransportApiService',
        function($scope, TransportApiService) {
            $scope.onSubmit = (evt) => {
                evt.preventDefault();
                const form = new FormData(evt.target);
                const originVals = {
                    place: form.get('place_origin'),
                    name: form.get('name_origin')
                };
                const destinationVals = {
                    place: form.get('place_destination'),
                    name: form.get('name_destination')
                };
                const promises = [
                    TransportApiService.getStop(originVals),
                    TransportApiService.getStop(destinationVals)
                ];
                Promise.allSettled(promises).then(results => {
                    const [originStop, destinationStop] = results.map(r => r.value);
                    const tripUrl = TransportApiService.createTripUrl({
                        originStop,
                        destinationStop,
                        time: form.get('itdTime'),
                        date: form.get('date-input')
                    });
                    const hiddenTripAnchor = evt.target.querySelector('#hidden-trip-anchor');
                    if (hiddenTripAnchor) {
                        // we directly manipulate the href here instead of using
                        // ng-href with scope variable, since the latter did not
                        // yet update the href when triggering the click event.
                        hiddenTripAnchor.href = tripUrl;
                        hiddenTripAnchor.click();
                        // resetting hidden anchor
                        hiddenTripAnchor.href = '';
                    }
                });
            };
        }]);
