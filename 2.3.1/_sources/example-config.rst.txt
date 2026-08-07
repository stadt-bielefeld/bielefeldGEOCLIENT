Beispiel
########

Beispiel für die Konfiguration von Hintergrund- und Themenkarten
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

Im folgenden wird das Zusammenspiel zwischen `layers_conf.yaml` und `default_conf.yaml` an einem Beispiel verdeutlicht. In der `layers_conf.yaml` wurde auf die Angabe der jeweiligen `source`-Attribute der Übersichtlichkeit halber verzichtet.


.. code-block:: yaml

    groups:
      - name: point_group
        title: Point Group
        layers:
          - pubs
          - bars
          - nightclubs
      - line_group
        title: Line Group
        status: inactive
        layers:
          - residential
          - primary
          - motorway
    layers:
      - name: mono_background
        title: Mono Background
      - name: color_background
        title: Color Background
      - name: aerial_background
        title: Aerial Background
        status: inactive
      - name: pubs
        title: Pubs
      - name: bars
        title: Bars
      - name: nightclubs
        title: Nightclubs
        status: inactive
      - name: residential
        title: Residential
      - name: primary
        title: Primary
      - name: motorway
        title: Motorway
        status: inactive

Würde diese `layers_yaml.conf` zusammen mit einer `default-config.yaml`, in der keine Konfiguration der Attribute `groups` und `layers` vorgenommen wurde, verwendet werden, stünden dem Benutzer die Hintergrundkarten `mono_background` und `color_background` sowie die Gruppe `point_group` mit den Layern `pubs` und `bars` zur Verfügung. Alle anderen Hintergrundkarten, Gruppen und Layer sind mit `status: inactive` deaktiviert.

Nachfolgend werden mit der `default-config.yaml` durch Verwendung der `include`, `exclude` und `explicit` Attribute ausschließlich die Hintergrundkarte `aerial_background`, sowie die Gruppen `point_group` nur mit dem Layer `pubs` und die Gruppe `line_group` mit allen ihr zugeordneten Layern dem Benutzer bereitgestellt.

.. code-block:: yaml

    groups:
      include:
        - line_group
    layers:
      exclude:
        - bars
      include:
        - motorway


Beispiel der Anwendungskonfiguration
""""""""""""""""""""""""""""""""""""

Im folgenden eine beispielhafte Konfiguration der Anwendung. Es wurden alle Einstellmöglichkeiten mit Ausnahme der Konfigurationen für Hintergrundkarten, Gruppen und Themenkarten verwendet, auf die im vorherigen Beispiel bereits eingegangen wurde.

.. code-block:: yaml

    app:
      tooltipDelay: 2000
      sidebarOpen: False
      preferredLanguage: 'de_DE'
    map:
      center: [8.2175, 53.1512]
      centerProjection: "EPSG:4326"
      zoom: 12
      projection: "EPSG:4326"
      projectionExtent:
        - 6
        - 47
        - 15
        - 54
      maxExtent:
        - 6
        - 47
        - 15
        - 54
      minZoom: 4
      maxZoom: 19
    componentes:
      geolocation: True
      layerswitcher: True
      legend: True
      print: True
      scaleLine: True
      search: True
    searchConfig:
      zoom: 14
      geocoder: Nominatim
      geocoderOptions:
        limit: 10
      resultMarkerVisible: 3000
      resultMarker:
         graphicFile: highlight-result.svg
         graphicWidth: 16
         graphicHeight: 16
         graphicScale: 2
    geolocationConfig:
      tracking: False
      zoom: 14
    printConfig:
      chooseCells: True
      chooseStreetIndex: True
      availablePageLayouts:
        "a4-portrait":
          label: A4
          icon: "glyphicon-resize-vertical"
          value:
            - 210
            - 297
        "a4-landscape":
          label: A4
          icon: "glyphicon-resize-horizontal"
          value:
            - 297
            - 210
      pageLayouts:
        - "a4-portrait"
        - "a4-landscape"
    urlMarkersConfig:
      markerStyle:
        radius: 10
        strokeWidth: 2
      defaultSrs: EPSG:4326
      popupOffset: [0, -10]
