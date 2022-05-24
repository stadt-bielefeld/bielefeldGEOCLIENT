var munimapConfig = {
  app: {
      tooltipDelay: 2000
  },
  map: {
      center: [468152.5616,5764386.17546],
      centerProjection: 'EPSG:25832',
      zoom: 8,
      projection: 'EPSG:25832',
      projectionExtent: [-46133.17, 5048875.26857567, 1206211.10142433, 6301219.54],
      maxExtent: [243900, 4427757, 756099, 6655205],
      minZoom: 7,
      maxZoom: 15
  },
  backgrounds: {
      include: ['omniscale_gray']
  },
  components: {
      search: {
          geocoder: 'Nominatim',
          geocoderOptions: {
              viewbox: [
                  8.34154267980772,
                  51.905836372029,
                  8.72247497339103,
                  52.1276204795065
              ]
          },
          zoom: 16
      },
      print: {},
      layerswitcher: {},
      legend: {},
      geolocation: {
          zoom: 16,
          tracking: false
      }
  },
  printConfig: {
      pageSizes: {
          'a5-portrait': {
              'label': 'A5',
              'icon': 'glyphicon-resize-vertical',
              'value': [148, 210]
          },
          'a5-landscape': {
              'label': 'A5',
              'icon': 'glyphicon-resize-horizontal',
              'value': [210, 148]
          }
     }
  }
};