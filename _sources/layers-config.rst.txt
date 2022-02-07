.. _layersconf:

Layer-Optionen
##############

layers
------

Konfigurationen eines Layers. Auf Einzelheiten zu komplexeren Konfigurationseinträgen wird jeweils in einem gesonderten Abschnitt eingegangen.

``name``
""""""""
Zur Identifikation genutzter Name des Layers. Muss eindeutig sein.

``title``
"""""""""
Angezeigter Name des Layers.

``attribution``
"""""""""""""""
Attributierung, die zu dem Layer in der Karte angezeigt wird.

``base``
""""""""
Name des Layers, dessen Konfiguration als Basis des Layers herangezogen wird. Es werden alle Eigenschaften vererbt und können dann gezielt überschrieben werden.

.. code-block:: yaml

    layers:
      - name: wms_background
        title: WMS Background
        type: wms
        source:
          url: "http://www.example.org/wms/service?"
          fomat: "image/png"
          layers:
            - color
          srs: "EPSG:4326"
      - name: mono_background
        title: Mono background
        base: wms_background
        source:
          layers:
            - mono

``status``
""""""""""
Legt fest, ob der Layer aktiv ist. Aktive Layer werden, soweit in der :ref:`default-config.yaml <defaultconf>` oder einer `App-Konfiguration` nicht anders angegeben, in der Karte angezeigt. Mögliche Werte sind `active` und `inactive`. Fehlt dieses Attribut, wird der Layer auf `active` gesetzt.

``catalog``
"""""""""""
Soll die Gruppe im Katalog auftauchen kann dies hier eingesetllt werden. Standartwert `false`. Zusätzlich kann hier auch noch ein Titel mit angegeben werden.

.. code-block:: yaml
 
    catalog:
      title: Parken Mobilität

``opacity``
"""""""""""
Deckkraft des Layers.

``metadataUrl``
"""""""""""""""
Externe URL zum Anzeigen von Metadaten, wird u.a. im Katalog verwendet. 

``background``
""""""""""""""
Definiert ob ein Layer ein Hintergrundlayer ist. Standardwert: `false`. 

``directAccess``
""""""""""""""""
Ist der Parameter gesetzt, wird der Dienst direkt abgefragt und nicht über die Anwendung die als Proxy dient.. 


``cluster``
"""""""""""
Definiert ob ein Layer geclustert werden soll. Dies gilt nur für Layer mit dem `type` `postgis`. Der Standartwert für diese Option ist `false`. Alle Layer mit `cluster` `true` die zur selben Gruppe gehören, werden zusammen geclustert.

``abstract``
""""""""""""
Beschreibung welche Daten in dem Layer angezeigt werden, wird u.a. in der Darstellung des Katalogs verwendet. 

``type``
""""""""
Mögliche Typen sind `wms`, `tiledwms`, `wmts`, `postgis` und `digitize`. Je nach angegebenen `type` wird eine entsprechende `source` erwartet.

``create_index``
""""""""""""""""
Diese Option ist nur für Layer mit dem `type` `postgis` und `digitize` gültig. Sie legt fest, ob für den Layer beim Drucken ein Index-Dokument erstellt und ein Kachelgitter zu der Karte hinzugefügt werden soll. Der Standartwert für diese Option ist `true`.

``source``
""""""""""
Konfiguration der Datenquelle des Layers. Einzelheiten unter `source`_.

``featureinfo``
"""""""""""""""
Konfiguration der Informationsabfrage des Layers. Dies gilt nur für Layer mit dem `type` `postgis`, `wms` oder `tiledwms`. Fehlt dieses Attribut oder ist der Wert `null` gesetzt, erfolgt keine Informationsabfrage für diesen Layer.

Konfiguriert, ob in der Kartenanwendung eine `GetFeatureInfo`-Abfrage für Layer vom `type` `wms` oder `tiledwms` durchgeführt bzw. Informationen zu einer Geometrie für Layer vom `type` `postgis` angezeigt werden soll.

Für Layer vom `type` `wms` oder `tiledwms` ist das Attribut `target` zu verwenden. Es definiert, wie das Ergebnis der `GetFeatureInfo`-Abfrage durch die Anwendung dargestellt wird. Mögliche Werte sind:

  `_popup`
      Zeigt die Antwort der Anfrage in einem IFrame in einem, durch die Anwendung erzeugten, Popup. Zusätzlich können über die Attribute `width` und `height` die Breite bzw. Höhe des IFrames in Pixel eingestellt werden. Der Default-Wert für `width` beträgt 300, der Default-Wert für `height` beträgt 150. Diese werden verwendet, wenn das entsprechendne Attribut nicht gesetzt wurde.

  `_blank`
      Zeigt die Antwort der Abfrage in einem neuen Browserfenster bzw. einem neuen Browsertab.

  CSS-Identifikators (Klasse oder ID eines Elements)
      Zeigt die Antwort der Abfrage im angegebenen Element. Hierbei werden die der Antwort evtl. vorkommende HTML-Tags `meta`, `link`, `title` und `script` vor dem Anzeigen entfernt.

Für Layer vom `type` `wms` oder `tiledwms` steht das Attribut `featureCount` zur Verfügung. Hiermit wird festgelegt, für wie viele übereinander liegende Features Informationen angezeigt werden sollen. Der Default-Wert ist 1.

Für Layer vom `type` `wms` oder `tiledwms`, deren `GetFeatureInfo`-Abfrage das `INFO_FORAMT` `application/vnd.ogc.gml` unterstützen kann das Attribute `gml` auf `true` gesetzt werden um die abgefragte Geometrie in der Karte hervorzuheben. Mit dem Attribute `gmlStyle` kann ein Styling für die zurückgelieferten Geometrien definiert werden. Wie ein Styling zu definieren ist, ist im Abschnitt :ref:`Style <style>` erläutert.

Für Layer vom `type` `postgis` wird immer ein durch die Anwendung erzeugtes Popup verwendet. Die anzuzeigenden Eigenschaften einer Geometrie sind im Attribut `properties` als Liste zu definieren.


Beispiel für WMS-GetFeatureInfo Ergebnis im Kartenpopup mit definierter Breite, Höhe und maximale Anzahl übereinander liegender Features, für die Informationen abgerufen werden sollen:

.. code-block:: yaml

    layers:
      - name: wms_1
        title: WMS 1
        type: wms
        source:
          [...]
        featureinfo:
          target: '_popup'
          width: 500
          height: 250
          featureCount: 10
          gml: true
          gmlStyle:
            strokeWidth: 2
            strokeColor: '#f00'
            fillColor: '#00f'


``legend``
""""""""""
Konfiguration der anzuzeigenden Legende des Layers. Fehlt dieses Attribut oder ist der Wert `null` gesetzt, erfolgt keine Anzeige einer Legende für diesen Layer.

Konfiguriert die Angezeigte Legende des Layers. Für Layer vom `type` `wms` oder `tiledwms` werden keine Attribute benötigt. In diesem Fall wird eine `GetLegendGraphic`-Anfrage gestellt und das Ergebnis als Legendenbild eingebunden.

Für Layer vom `type` `postgis` kann das Attribute `type` verwendet werden um eine Legende zu erzeugen. In `type` ist hierbei der Geometrietyp (`Point`, `Line`, `Polygon`) anzugeben, der als Legende dargestellt werden soll. Dieser wird dann in der für den Layer angegebenen Darstellung angezeigt.

Für alle Arten von Layern kann das Attribut `url` verwendet werden. Hierbei muss `url` auf eine Grafik verweisen, die als Legende angezeigt werden soll.


``searchConfig``
""""""""""""""""
Pro Layer kann auch eine eigene Suche definiert werden,


.. _style:

``style``
"""""""""
Konfiguration der Darstellung des Layers. Dies gilt nur für Layer mit dem `type` `postgis`. Einzelheiten unter `style`.

Für nicht definierte Attribute wird der jeweilige `Standardwert von OpenLayers 5 <http://openlayers.org>`_ verwendet.


.. note:: Layer, die weder `groups` zugeordnet sind, stehen in der Anwendung nicht zur Verfügung.

``radius``
  Radius für Punkte. Angabe in Pixel.

``strokeColor``
  Linienfarbe für Punkte, Linien und Polygone. Angabe als Hex- oder RGB-Wert.

``strokeWidth``
  Linienbreite für Punkte, Linien und Polygone. Angabe in Pixel.

``strokeDashstyle``
  Linienart für Punkte, Linien und Polygone. Mögliche Werte sind `solid`, `dot`, `dash`, `dashdot`, `longdash` und `longdashdot`.

``strokeOpacity``
  Liniendeckkraft für Punkte, Linien und Polygone. Werte zwischen 0 (durchsichtig) bis 1 (deckend).

``fillColor``
  Füllfarbe für Punkte und Polygon. Angabe als Hex- oder RGB-Wert.

``fillOpacity``
  Fülldeckkraft für Punkte und Polygone. Werte zwischen 0 (durchsichtig) bis 1 (deckend).

``graphicFile``
  Grafik für Punkte. `graphicWidth` und `graphicHeight` sind mit anzugeben.

``graphicWidth``
  Breite der Grafik. Angabe in Pixel.

``graphicHeight``
  Höhe der Grafik. Angabe in Pixel.

``graphicRotation``
  Winkel um den die Grafik rotiert werden soll.

``graphicXAnchor``
  Horizontale Platzierung der Grafik relativ zur Punktgeometrie. Angabe in Pixel. Wenn nicht angegeben, wird die Grafik horizontal zentriert positioniert.

``graphicYAnchor``
  Vertikale Platzierung der Grafik relativ zur Punktgeometrie. Angabe in Pixel. Wenn nicht angegeben, wird die Grafik vertikal zentriert positioniert.

``graphicScale``
  Skalierungsfaktor für die Grafik. Werte zwischen 0 und 1 verkleinern die Grafik. Werte größer als 1 vergrößern die Grafik. Werte unter 0 spiegeln die Grafik, verhalten sich ansonsten wie positive Werte.

``text``
  Text der als Beschriftung der Geometrie angezeigt werden soll.

``propertyLabel``
  Eigenschaft der Geometrie, die als Beschriftung angezeigt werden soll.

``fontWeight``
  Schriftstärke. Mögliche Werte sind `normal`, `italic` und `bold`.

``fontSize``
  Schriftgröße. Hierbei ist die Einheit mit anzugeben. Erlaubt sind alle gängigen `CSS Eigenschaften <https://wiki.selfhtml.org/wiki/CSS/Eigenschaften/Schriftformatierung/font-size>`_.

``fontFace``
  Schriftart. Diese muss im System vorhanden sein.

``fontColor``
  Schriftfarbe. Angabe als Hex- oder RGB-Wert.

.. _groups:

groups
------

Liste mit Gruppen, die in der Anwendung verfügbar sein sollen.

.. note:: Um einen Layer in der Anwendung anzeigen zu können, muss dieser einer Gruppe zugeordnet werden.

Eine Gruppe wird mit folgenden Attributen konfiguriert:

``name``
""""""""
Zur Identifikation genutzter Name der Gruppe. Muss eindeutig sein.

``title``
"""""""""
Angezeigter Name der Gruppe.

``layers``
""""""""""
Liste mit der Gruppe zugeordneten Layern

``status``
""""""""""
Legt fest, ob die Gruppe aktiv ist. Aktive Gruppen werden, soweit in der `default-config.yaml` oder einer `App-Konfiguration` nicht anders angegeben, in der Karte angezeigt.

Mögliche Werte sind `active` und `inactive`. Fehlt dieses Attribut, ist Gruppe automatisch auf `active` gesetzt.


``showGroup``
"""""""""""""
Die Gruppe wird in der Layerauswahl wie ein Layer angezeigt. Nur bei Gruppen mit einem Layer verwenden. Standartwert `true`.

``singleSelect``
""""""""""""""""
Es kann nur ein Layer innerhalb der Gruppe sichtbar sein. Schaltet der Nutzer einen anderen Layer sichtbar, werden alle weiteren Layer nicht sichtbar.

``catalog``
"""""""""""
Soll die Gruppe im Katalog auftauchen kann dies hier eingesetllt werden. Standartwert `false`. Zusätzlich kann hier auch noch ein Titel mit angegeben werden.

.. code-block:: yaml
 
    catalog:
      title: Parken Mobilität


``abstract``
""""""""""""
Beschreibung welche Daten in der Gruppe angezeigt werden, wird u.a. in der Darstellung des Katalogs verwendet. 


``legend``
""""""""""
Konfiguration der anzuzeigenden Legende des Gruppe. Fehlt dieses Attribut oder ist der Wert `null` gesetzt, erfolgt keine Anzeige einer Legende für diesen Gruppe.

Ist eine Legende in der Gruppe definiert werden alle Legenden der Layer unterdrückt. Es wird nur die Angabe einer URL unterstützt und keine GetLegendGraphics wie zum Beispiel bei Layern. 


``metadataUrl``
"""""""""""""""
Externe URL zum Anzeigen von Metadaten, wird u.a. im Katalog verwendet. 

Beispiel

.. code-block:: yaml

  groups
    - name: lichtsignalanlagen
      title: 'Ampeln'
      catalog: true
      status: inactive
      showGroup: false
      abstract: Ampeln Abstract
      metadataUrl: 'http://www.example.org'
      layers:
        - lichtsignalanlagen_p

    - name: bodenrichtwerte
      title: Bodenrichtwerte 2016
      layers:
        - bodenrichtwerte_t
        - bodenrichtwerte_brwznr_t



Layer für den Druck
-------------------

Um den Druck zu optimieren gibt es die Möglichkeit, über die Namenserweiterungen `_print` und `_raw` alternative Dienste zu konfigurieren. So kann z.B. ein Layer `karte` im Druck automatisch durch den Layer `karte_print` ausgetauscht werden. Der `print_karte` Layer kann hierbei gesondert konfiguriert werden (WMS statt WMTS, höhere DPI, etc.).
Layer mit einer Namenserweiterung dürfen weder nicht in `groups` auftauchen.


``[name]_print``
"""""""""""""""""

Wird im Druck anstelle des in der Karte sichtbaren Layers verwendet. So kann z.B. eine hoch aufgelöste Variante des Layers benutzt werden.

Beispiel:

.. code-block:: yaml

    layers:
      - name: example_layer
        title: Example Layer
        type: wms
        source:
          [...]
      - name: example_layer_print
        title: Example Layer
        type: wms
        source:
          [...]


``[name]_raw``
"""""""""""""""

Wird im Druck anstelle des in der Karte sichtbaren Layers verwendet, wenn ein Vektor-Formate gedruckt wird.

Beispiel:

.. code-block:: yaml

    layers:
      - name: example_layer
        title: Example Layer
        type: wms
        source:
          [...]
      - name: example_layer_raw
        title: Example Layer
        type: wms
        source:
          [...]



.. _source:

Layer Quellen
-------------

Konfiguration der Datenquelle eines Layers. Je nach Layer-`type` werden unterschiedliche Attribute benötigt. Nachfolgend sind die `source`-Attribute zum zugehörigen Layer-`type` aufgeführt.

``wms``
"""""""

  url
      URL des Dienstes. Diese muss mit `?` oder `&` enden.

  format
      Bildtyp. Z.B. 'image/png'.

  layers
      Liste zu verwendender Layer.

  srs
      Zu verwendendes Koordinatensystem.

  encoding
      Zeichenencoding der Antwort auf eine `GetFeatureInfo`-Anfrage. Fehlt das Attribut wird `utf-8` verwendet.


.. code-block:: yaml

    layers:
      - name: example_layer
        title: Example Layer
        type: wms
        source:
          url: "http://www.example.org/wms/service?"
          format: "image/png"
          layers:
            - example
          srs: "EPSG:4326"
          encoding: "iso8859-15"


``tiledwms``
""""""""""""

Wie WMS, Karten werden jedoch in 256x256 Pixel große Kacheln abgerufen.


``wmts``
""""""""

  url
      URL des Dienstes. Diese muss mit `/` enden.

  format
      Bildtyp. Z.B. 'image/png'.

  layer
      Layer des Dienstes, der verwendet werden soll.

  srs
      Zu verwendendes Koordinatensystem.

  extent
      Gültigkeitsbereich des Dienstes. Siehe Capabilities-Dokument des Dienstes.

  matrixSet
      Zu verwendendes Matrix-Set.

  levels
      Anzahl im Matrix-Set enthaltener Detailstufen.

  hqUrl
      URL des Dienstes, der für Clients mit hochaufgelösten Displays verwendet werden soll.

  hqLayer
      Layer des Dienstes, der für Clients mit hochaufgelösten Displays verwendet werden soll.

  hqMatrixSet
      Matrix-Set des Dienstes, das für Clients mit hochaufgelösten Displays verwendet werden soll.

.. code-block:: yaml

    layers:
      - name: example_layer
        title: Example Layer
        type: wmts
        source:
          url: "http://www.example.org/wmts/"
          format: "image/png"
          layer: example
          srs: "EPSG:4326"
          extent: [6, 47, 15, 54]
          matrixSet: epsg_4326
          levels: 19
          hqUrl: "http://www.example.org/wmts_hq/"
          hqLayer: example_hq
          hqMatrixSet: epsg_4326_hq


``postgis``
"""""""""""

  type
      Geometrietyp, den der SQL-Query zurückliefert

  query
      SQL-Query, der anzuzeigende Geometrien aus der Datenbank selektiert.


.. code-block:: yaml

    layers
      - name: example_layer
        title: Example Layer
        type: postgis
        source:
          type: point
          query: SELECT geometry FROM points_table WHERE geometry && !bbox!
        style:
          radius: 10
          strokeColor: '#c00'
          fillColor: '#00c'



.. note:: Das `where-statement` **geometry && !bbox!** sorgt dafür, dass die Anfrage an die Datenbank nur Geometrien des aktuellen Kartenausschnitts zurückliefert.