// this is for the moment a copy of base-app document ready function
var munimapBootstrap = function(appConfig) {
  var printConfig = {
    printUrl: undefined
  };
  try {
    printConfig.printUrl = printUrl;
  } catch (e) {
    angular.noop();
  }

  var configObject = $.extend(true, {}, defaultMunimapConfig, {
    printConfig: printConfig
  }, appConfig);

  // get projection object from epsg code
  configObject.map.projection = ol.proj.get(configObject.map.projection);
  if(configObject.map.projectionExtent !== undefined) {
    configObject.map.projection.setExtent(configObject.map.projectionExtent);
  }

  angular.module('munimapBase').constant('munimapConfig', configObject);
  angular.bootstrap(document, ['munimapBase', 'munimap']);
};