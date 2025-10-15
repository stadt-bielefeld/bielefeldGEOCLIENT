Layer-Definition
================

Die Layer können in unterschiedlichen Konfigurationen definiert werden, die von der Anwendung zusammen
gefasst werden. Innerhalb einer Konfiguration können folgende Bereiche definiert werden:

``layers``: Definition der einzelnen Layer.
``groups``: Liste von Gruppen. Jeder Gruppe können ein oder mehrere Layer zugeordnet werden.

Beispiel:

.. code-block:: yaml

    groups:
      - example_group

    layers:
      - name: example_layer
        title: Example Layer
        type: wms
        source:
          url: "http://www.example.org/wms/service?"
          fomat: "image/png"
          layers:
            - example
          srs: "EPSG:4326"
      - name: group_layer
        title: Group Layer
        type: wms
        source: "http://www.example.org/wms/service?"
          fomat: "image/png"
          layers:
            - example
          srs: "EPSG:4326"


.. note::

  Alle Layer die in einer der Anwendungen verwendet werden sollen müssen in der ``layers_config.yaml`` konfiguriert sein. Über ``status`` sowie den ``layers`` und ``groups`` Optionen der App-Konfiguration kann dann für jede Anwendung konfiguriert werden, welche Layer in dieser Anwendung eingebunden werden sollen.


Neuen Layer erstellen
---------------------

Um eine neuen Layer zu erstellen muss dieser in der Konfigurationsdatei hinzugefügt werden. Es kann zwischen verschiedenen Typen ausgewählt werden. Je nach Layer-`type` werden unterschiedliche Attribute benötigt. Ausführliche Beschreibung der Quellen finden sich im Kapitel :ref:`Source <source>`

Im Folgenden sind einige Beispiele konfiguriert.

Externen WMS Dienst einbinden:

.. code-block:: yaml

    layers:
      - name: omniscale_gray
        title: OSM Omniscale Grayscale
        type: wms
        status: inactive
        attribution: '© 2016 Omniscale • Kartendaten: OpenStreetMap - (Lizenz: ODbL)'
        source:
          url: "http://maps.omniscale.net/wms/mapsosc-b697cf5a/grayscale/service?"
          format: "image/png"
          layers:
            - osm
          srs: "EPSG:25832"


Vektordaten einbinden

.. code-block:: yaml

    layers:
      - name: polygons
        title: polygons base
        type: postgis
        attribution: 'Vektordaten: OpenStreetMap (Lizenz: ODbL)'
        source:
          type: polygon
          srid: 25832
          query:
            SELECT geometry
            FROM alkis_buildings
        style:
          type: simple
          strokeColor: '#c3c'
          strokeWidth: 1
          fillColor: '#c6c'
        featureinfo:
          target: '_popup'
          properties:
            - name
        legend:
          type: polygon


Neue Gruppe erstellen
---------------------

In einer Gruppe können mehrere Layer zusammen gefasst werden. Diese können dann zum Beispiel für die Themenkarten erstellt werden.

Eine ausführliche Beschreibung aller Eigenschaften einer Gruppe finden sich im Kapitel :ref:`groups <groups>`

Beispiel:

.. code-block:: yaml

      groups:
        - name: altkleidercontainer
          title: Altkleidercontainer
          layers:
            - altkleidercontainer

        - name: bodenrichtwerte
          title: Bodenrichtwerte 2016
          layers:
            - bodenrichtwerte_t
            - bodenrichtwerte_brwznr_t
