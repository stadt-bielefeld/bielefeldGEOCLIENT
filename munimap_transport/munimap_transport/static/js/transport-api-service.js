angular.module('munimapBase')
    .provider('TransportApiService', [function (timetableServiceURL, timetableStopfinderAPI, timetableTripAPI, timetableStopfinderPriorities) {
        this.$get = ['$http', 'timetableServiceURL', 'timetableStopfinderAPI', 'timetableTripAPI', 'timetableStopfinderPriorities',
            function($http, timetableServiceURL, timetableStopfinderAPI, timetableTripAPI, timetableStopfinderPriorities) {
                const TransportApi = function () {};

                TransportApi.prototype.createStopRequest = function (opts) {
                    const stopName = opts.name ? opts.name : '';
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

                        const fallbackStop = res.data.locations?.[0];
                        if (!timetableStopfinderPriorities) {
                            return fallbackStop?.id;
                        }
                        // We iterate over the list of prioritized keywords and
                        // return the stop with the highest priority. Keywords in
                        // timetableStopfinderPriorities are ordered by descending priority.
                        const stop = timetableStopfinderPriorities.reduce((prev, cur) => {
                            if (prev) {
                                return prev;
                            }
                            return res.data.locations?.find(item => item.name.toLowerCase().includes(cur.toLowerCase()));
                        }, undefined);
                        if (!stop) {
                            return fallbackStop?.id;
                        }
                        return stop.id;
                    });
                };

                const transportApi = new TransportApi();

                return transportApi;
            }];
    }]);
