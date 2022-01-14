import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';

angular.module('munimapBase.postMessage', ['anol.map'])
    .provider('PostMessageService', [function () {

        let _defaultAllowedUrls = [];

        this.setDefaultAllowedUrls = function (allowedUrls) {
            _defaultAllowedUrls = allowedUrls || [];
        };

        this.$get = ['$rootScope', '$window', 'MapService', 'LayersService', 'munimapConfig',
            function ($rootScope, $window, MapService, LayersService, munimapConfig) {

            const PostMessage = function (defaultAllowedUrls) {
                this.handlers = {};
                this.defaultAllowedUrls = defaultAllowedUrls;
                const self = this;

                const env = {
                    map: MapService.getMap(),
                    mapSrs: MapService.getMap().getView().getProjection().getCode(),
                    appName: munimapConfig.app.title,
                    olGeoJSON: GeoJSON,
                    olWKT: WKT,
                    LayersService: LayersService,
                    MapService: MapService
                };

                $window.addEventListener('message', function (evt) {

                    if (!angular.isDefined(evt.data) || !angular.isDefined(evt.data.action)) {
                        return;
                    }

                    const handler = self.handlers[evt.data.action];
                    if (!handler) {
                        return;
                    }

                    const allowedUrls = handler.allowedUrls;
                    const isListed = allowedUrls.some(function (item) {
                        return item === evt.origin;
                    });

                    if (!isListed) {
                        console.warn(`Blocked PostMessage '${evt.data.action}' from ${evt.origin}`);
                        return;
                    }

                    const val = evt.data.value || {};

                    handler.callback(val, env, function (d) {
                        self.sendMessage(d, evt.origin);
                    });
                });
            };

            PostMessage.prototype.registerHandler = function (evtName, allowedUrls, callback) {
                console.info(`Registering handler for ${evtName}, allowedUrls: ${allowedUrls}`);
                this.handlers[evtName] = {
                    allowedUrls: allowedUrls || this.defaultAllowedUrls,
                    callback: callback
                }
            };

            PostMessage.prototype.sendMessage = function (options, target) {
                if ($window.opener === null || $window.opener === undefined) {
                    $window.parent.postMessage(options, target);
                } else {
                    $window.opener.postMessage(options, target);
                }
            };

            PostMessage.prototype.sendReady = function () {
                var self = this;
                var data = {
                    success: true
                };
                var options = {
                    action: 'munimapReady',
                    value: data
                };
                // explicitly send to all origins, "ready" is not considered a security risk
                self.sendMessage(options, '*');
            };

            const postMessage = new PostMessage(_defaultAllowedUrls);

            // register handler for plugins
            const pluginNames = Object.keys($window.postMessagePlugins || {});
            angular.forEach(pluginNames, function (pluginName) {
                const plugin = $window.postMessagePlugins[pluginName];
                postMessage.registerHandler(plugin.event, plugin.allowedUrls, plugin.callback);
            });

            $rootScope.$watch('appReady', function () {
                if ($rootScope.appReady) {
                    postMessage.sendReady();
                }
            });

            return postMessage;
        }];
    }]);
