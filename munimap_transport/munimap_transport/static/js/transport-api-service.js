angular.module('munimapBase')
    .provider('TransportApiService', [function (timetableServiceURL, timetableStopfinderAPI, timetableTripAPI) {
        this.$get = ['$http', 'timetableServiceURL', 'timetableStopfinderAPI', 'timetableTripAPI',
            function($http, timetableServiceURL, timetableStopfinderAPI, timetableTripAPI) {
                const TransportApi = function () {};

                TransportApi.prototype.createStopRequest = function (opts) {
                    const stopName = `${opts.place ? opts.place : ''}%20${opts.name ? opts.name : ''}`;
                    let url = new URL(timetableStopfinderAPI, timetableServiceURL);
                    // We cannot use the searchParams features of the URL class here since
                    // the API endpoint expects space in the query parameter 'name_sf' to be
                    // encoded as %20 instead of +.
                    url = url + `&name_sf=${stopName}`;
                    return $http.get(url);
                };

                TransportApi.prototype.createTripUrl = function (opts) {
                    const {
                        originStop,
                        destinationStop,
                        time,
                        date
                    } = opts;
                    const url = new URL(timetableTripAPI, timetableServiceURL);
                    const formikParams = [
                        'itdTripDateTimeDepArr=dep'
                    ];

                    if (originStop) {
                        const originParam = `origin=${originStop}`;
                        formikParams.push(originParam);
                    }
                    if (destinationStop) {
                        const destinationParam = `destination=${destinationStop}`;
                        formikParams.push(destinationParam);
                    }
                    if (time) {
                        let [hours, minutes] = time.split(':');
                        if (hours && minutes) {
                            hours = hours.padStart(2, '0');
                            minutes = minutes.padStart(2, '0');
                            const timeFormatted = hours + minutes;
                            const timeParam = `itdTime=${timeFormatted}`;
                            formikParams.push(timeParam);
                        }
                    }
                    if (date) {
                        let [days, months, years] = date.split('.');
                        if (days && months && years) {
                            days = days.padStart(2, '0');
                            months = months.padStart(2, '0');
                            years = years.padStart(4, '0');
                            const dateFormatted = days + months + years;
                            const dateParam = `itdDateDayMonthYear=${dateFormatted}`;
                            formikParams.push(dateParam);
                        }
                    }

                    const formikParamString = formikParams.join('&');
                    url.searchParams.set('formik', formikParamString);

                    return url.href;
                };

                TransportApi.prototype.getStop = function (opts) {
                    return this.createStopRequest(opts).then(res => {
                        const stop = res.data.locations?.[0];
                        if (!stop) {
                            return;
                        }
                        return stop.id;
                    });
                };

                const transportApi = new TransportApi();

                return transportApi;
            }];
    }]);
