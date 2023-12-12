.. _defaultconf:

App-Optionen
############

Basis-Konfiguration der Web-Anwendung. Alle `App-Konfigurationen` haben diese Konfiguration als Grundlage. Außerdem ist sie die Konfiguration der Hauptanwendung. In dieser Konfiguration wird festgelegt, welche Hintergrundlayer, Gruppen und Layer dem Benutzer angezeigt werden. Außerdem erfolgt hier die Konfiguration der einzelnen Komponenten der Webanwendung wie z.B. der Orts-Suche. Außerdem wird in dieser Konfiguration definiert, welche Komponenten in der Webanwendung aktiv sein sollen.

Die Konfiguration ist in einzelne Abschnitte unterteilt die in der nachfolgenden Übersicht dargestellt und in den folgenden Unterpunkten näher beschrieben werden.

  ``app``
    Konfigurationen zum Verhalten der Anwendung

  ``map``
    Konfiguration der Kartenansicht

  ``groups``
    Konfiguration der in der Anwendung zur Verfügung stehenden Layergruppen

  ``layers``
    Konfiguration der in der Anwendung zur Verfügung stehenden Layer

  ``components``
    Konfiguration und (De-)Aktivierung der einzelnen Komponenten der Anwendung

  ``communication``
    Konfiguration der PostMessage Schnittstelle der Anwendung

  ``printConfig``
     Konfiguration des Druck-Moduls

  ``searchConfig``
    Konfiguration des Such-Moduls

  ``geolocationConfig``
    Konfiguration des Geolocation-Moduls

  ``urlMarkersConfig``
    Konfiguration des UrlMarkers-Moduls

  ``digitizeConfig``
    Konfiguration des Digitize-Moduls


app
---

Im Nachfolgenden werden die Konfigurationsattribute zum grundlegenden Verhalten der Webanwendung vorgestellt.

  ``tooltipDelay``
    Zeit die der Mauscursors über einem Element verweilen muss bis der entsprechende Tooltip angezeigt wird. Angabe in Millisekunden. Standardwert `1000`.

  ``sidebarOpen``
    Sidebar wird geöffnet angezeigt. Standardwert `false`.

  ``preferredLanguage``
    Voreingestellte Sprache für JavaScript-seitige Übersetzungen. Standardwert `de_DE`.

  ``headerLogo``
    URL zum Logo welches im Sitebar-Header angezeigt wird.

  ``headerLogoLink``
    Link der bei klick auf das Logo geöffnet werden soll.

  ``hideLink``
    Link in der Seitenleisten oben wird ausgeblendet.

  ``versionString``
    Versionsnummer die in der Anwendung angezeigt wird.

  ``showNoBackground``
    Legt fest, ob die Auswahl "Kein Hintergrundlayer" im Layerswitcher verfügbar ist. Standardwert `true`.

  ``title``
    Legt den Titel der Webseite fest, der für die Anwendung verwendet werden soll.

  ``tour``
    Verweis auf die zu nutzende Tour. Es ist nur die Datei, nicht der komplette Pfad anzugeben. Standardwert `false`.

  ``disableMouseZoom``
    Schaltet das Zoomen per Mausrad ab. Standardwert `false`.

  ``enableMouseZoomKey``
    Schaltet das Zoomen per Mausrad mit gedrückter [Strg]-Taste ein. Standardwert `false`. Für diesen Modus darf ``disableMouseZoom`` nicht ``true`` sein.

  ``disablePinchZoom``
    Schaltet das Zoomen per Geste ab. Standardwert `false`.

  ``disablePinchMove``
    Schaltet das Verschieben der Karte per Geste ab. Standardwert `false`.

  ``enableTwoFingersPinchMove``
    Schaltet das Verschieben der Karte mit 2 Finger Geste ein. Standardwert `false`. In diesem Modus kann nicht per Geste gezoomt oder die Karte rotiert werden.

  ``disableFeatureInfo``
    Schaltet das Feature Info Popup für WMS Layer ab. Standardwert: `false`

  ``iframe``
    Ermöglicht eine App die auf eine externe Anwendung verlinkt. Als Wert muss der Link zur Zielseite angegeben werden.

  ``contextMenu``
    Wenn aktiviert, wird durch Rechtsklick das Kontextmenü aktiviert. Es kann der Name (ohne Pfad) der zu nutzenden Datei angegeben werden oder `true` (dann wird `index.html` verwendet). Standardwert `false`. Weitere Details im :ref:`Abschnitt Kontextmenü <context_menu>`.


  ``showLogin``
    Der Login in der Sidebar wird nicht angezeigt. Standardwert `false`.

  ``hideMetadata``
    Das Informaiton-i für die Metadaten wird ausgeblendet. Standardwert `false`.

  ``metaDescription``
    Beschreibung die in der Anwendung im Meta-Tag Description angezeigt wird.

  ``ogImage``
    Ermöglicht das hinterlegen eines Webseitenvorschaubildes durch Verwendung des og-image Tags.

  ``feedbackButton``
    Ermöglicht die Anzeige eines Feedback Buttons über den der User dann eine E-Mail via "mailto" verschicken kann. Im Body der E-Mail wird immer automatisch die aktuelle URL der Anwendung hinzugefügt.

    Beispiel::

      feedbackButton:
        email: somebody@example.com # setzt die E-Mail-Adresse
        subject: Feedback bielefeldGEOCLIENT # Betreff der Email
        body: Der Body-Text # Text for der URL der Anwendung im Body


Beispiel::

    app:
      tooltipDelay: 50
      sidebarOpen: true
      headerLogo: 'img/logo-sitebar.png'
      versionString: 'Vers. 0.9.322 (Beta-Version)'

map
---

Im Nachfolgenden wird die Konfiguration der Karte innerhalb der Webanwendung erläutert.

  ``center``
    Startkoordinate für die Karte. Kann nicht mit `bbox` zusammen verwendet werden.

  ``centerProjection``
    Projektion, in der die Startkoordinate angegeben ist.

  ``sidebar``
    Name des Tabs welcher beim Start geöffnet werden soll.

  ``defaultBackground``
    Name des Hintergrundlayers, der beim Aufruf der Karte angezeigt werden soll. Wenn nicht angegeben wird der erste definierte Hintergrundlayer angezeigt.

  ``defaultOverlays``
    Liste von Namen der Themenlayer, die beim Aufruf der Karte angezeigt werden sollen. Wenn nicht angegeben, sind alle Themenlayer nicht sichtbar.

  ``zoom``
    Detaillevel, dass beim Aufruf der Karte angezeigt wird. Kann nicht mit `bbox` zusammen verwendet werden.

  ``bbox``
    Startausdehnung der Karte. Kann nicht mit `center` zusammen verwendet werden.

  ``bboxProjection``
    Projektion, in der die Startausdehnung angegeben ist.

  ``projection``
    Projektion der Karte.

  ``projectionExtent``
    Gültigkeitsbereich der Projektion.

  ``maxExtent``
    Gültigkeitsbereich der Karte.
    Koordinaten sind in der Projektion der Karte anzugeben.
    Reihenfolge ist:
    - minimum Breitengrad
    - minimum Längengrad
    - maximum Breitengrad
    - maximum Längengrad

  ``minZoom``
    Kleinste Detailstufe, die angezeigt wird.

  ``maxZoom``
    Größte Detailstufe, die angezeigt wird.

  ``cluster``
    Beinhaltet die Attribute `distance` und `maxObjects`.
    `distance` definiert die Entfernung in Pixel, innerhalb derer Features zu einem Cluster zusammengefasst werden.
    `maxObjects` definiert die maximale Anzahl an Objekten, die nach Klick auf einen Cluster angezeigt werden. Beinhaltet ein Cluster mehr Features als in `maxObjects` definiert, wird bei einem Klick auf den Cluster zum nächst höheren Zoomlevel gewechselt.

Beispiel::

  map:
      sidebar: 'overlay'
      center:
          - 468152.5616
          - 5764386.17546
      centerProjection: "EPSG:25832"
      zoom: 8
      projection: "EPSG:25832"
      projectionExtent: [-46133.17, 5048875.26857567, 1206211.10142433, 6301219.54]
      maxExtent:
          - 243900
          - 4427757
          - 756099
          - 6655205
      minZoom: 7
      maxZoom: 15


groups
------

  ``include``
    Liste mit Elementen, die als `inactive` markiert sind, aber in die Anwendung eingebunden werden sollen.

  ``exclude``
    Liste mit Elementen, die nicht in die Anwendung eingebunden werden sollen.

  ``explicit``
    Ausschließlich die aufgeführten Elemente werden in die Anwendung eingebunden. Einträge in `include` und `exclude` werden ignoriert. Werden im Abschnitt `layers` mit `explicit` einzubindende Layer definiert überschreibt dies die `explicit`-Einträge im `groups` Abschnitt.

  ``singleSelect``
    Liste mit Gruppen. Wird die Gruppe sichtbar, werden alle anderen Gruppen nicht sichtbar.

Beispiel::

  groups:
      include:
          - food
          - plz

layers
------

  ``include``
    Liste mit Elementen, die als `inactive` markiert sind, aber in die Anwendung eingebunden werden sollen.

  ``exclude``
    Liste mit Elementen, die nicht in die Anwendung eingebunden werden sollen.

  ``explicit``
    Ausschließlich die aufgeführten Elemente werden in die Anwendung eingebunden. Einträge in `include` und `exclude` werden ignoriert. Ebenso werden die Einträge in `include` und `explicit` im `groups` Abschnitt ignoriert.


Beispiel::

  layers:
      explicit:
          - stations
          - busstop


components
----------

In diesem Abschnitt werden die einzelne Komponenten der Anwendung aktiviert bzw. deaktiviert. Die Angabe von `True` aktiviert eine Komponente, die Angabe von `False` deaktiviert sie.

Folgende Komponenten stehen zur Verfügung:

  ``geolocation``
    Zentriert die Karte auf die aktuelle Geoposition des Anwenders. Ist in der Anwendung als Schaltfläche sichtbar. Konfigurationen für diese Komponente werden im Abschnitt `geolocationConfig`_ vorgenommen.

  ``layerswitcher``
    Erlaubt das Wechseln zwischen Hintergrundkarten und das Hinzufügen / Entfernen von Themenkarten.

  ``legend``
    Zeigt Erläuterungen zu den in den Themenkarten angezeigten Daten.

  ``print``
    Exportiert einen vom Benutzer bestimmten Ausschnitt der angezeigten Karte. Konfigurationen für diese Komponente werden im Abschnitt `printConfig`_ vorgenommen.

  ``scaleLine``
    Zeigt die aktuelle Skalierung der Karte in km bzw. m an.

  ``scaleText``
    Fügt der Anwendung eine 1: Maßstabsauswahl hinzu.

  ``search``
    Erlaubt das Suchen nach Straßen bzw. Orten und zentriert die Karte auf ein ausgewähltes Suchergebnis. Konfigurationen für diese Komponente werden im Abschnitt `searchConfig`_ vorgenommen.

  ``overviewmap``
    Zeigt eine Übersichtskarte, in der der aktuelle Kartenausschnitt hervorgehoben ist.

  ``serviceButton``
    Fügt der Anwendung einen Button mit Untermenü hinzu. Standardwert: `false`.

  ``homeButton``
    Fügt der Anwendung einen Button hinzu mit dem zurück zur initialen Position der Karte gesprungen werden kann. Standardwert: `true`.

  ``menuButton``
    Fügt der Anwendung einen Button hinzu der das Seitenmenü öffnet. Standardwert: `true`.

  ``draw``
    Fügt der Karte Zeichenfunktionen hinzu. Es können Punkte, Marker, Linien, Polygone und Texte eingezeichnet und bearbeitet werden. Standardwert: `false`.

  ``measureLabelSegments``
    Zeigt, bei Verwendung der Messfunktion zwischenwerte an den Strecken bei Linien und Fläche an. Standardwert: `false`.

  ``saveSettings``
    Ermöglicht angemeldeten Benutzer Konfigurationen zur Anwendung zu speichern und wieder zu laden. Die Funktion kann über den Werkzeug-Button aufgerufen werden. Standardwert: `false`.

  ``timetable``
    Fügt der Karte die Fahrplanauskunft hinzu. Standardwert: `false`.

  ``searchDropdown``
    Ermöglicht es dem Benutzer mehrere Suchdienst in der Anwendung zu verwenden. Ist die Komponente aktiv wird neben dem Suchfenster geschaffen, dass über eine Dropdown-Liste eine Suche ausgewählt werden kann. Standardwert: `false`.

  ``alkis``
    Über die Alkis-Komponente können die verschiedenen ALKIS-Dienste von IP Syscon aktiviert werden. Hierbei ist zu beachten, dass auch die entsprechende Benutzerberechtigung vorliegen muss. Weitere Details im :ref:`Abschnitt ALKIS <alkis_information>`.

    Beispiel::

      alkis:
        simple: true # IP-Flurstücksauskunft einfach
        selection: true # IP-Flurstück nach Selektion
        pdf: true # IP-Flurstücksauskunft PDF
        official: true # IBR amtliche ALKIS-Produkte


  ``catalog``
    Fügt der Anwendung einen Button hinzu, der ein Popup mit zusätzlich einbindbaren Diensten öffnet. Standardwert: `false`.
    Außerdem kann definiert werden, ob neben den Gruppen die für den Katalog gekennzeichnet sind, auch Layer angezeigt werden soll. Au0erdem kann zwischen zwei Layoutvarianten gewählt werden. Der Standardwert für die Variante ist 'abstract'.

    Beispiel::

      catalog
        layer: false
        variant: 'abstract' # oder mouseover

  ``geoeditor``
    Fügt der Anwendung den geoEDITOR hinzu. Dieser erlaubt das Erstellen und Editieren von Geometrien und deren Attributen. Um den geoEDITOR in seiner Default Konfiguration zu verwenden, muss lediglich der Wert `true` angegeben werden.
    Konfigurationen für diese Komponente werden im Abschnitt `geoeditorConfig`_ vorgenommen. Standardwert: `false`.

  ``digitize``
    Macht aus der Anwendung eine Digitalisierungsanwendung. Dies erlaubt das Erstellen und Editieren von vordefinierten
    Digitalisierungslayern. Sowohl Geometrien als auch Attribute können hier editiert werden. Um das digitize-Modul zu verwenden,
    muss sowohl der Wert `true` angegeben werden, als auch mindestens ein Digitalisierungslayer unter `digitizeConfig`_
    konfiguriert werden. Standardwert: `false`.

componentPositions
------------------

In diesem Abschnitt können die in der Kartenanwendung als Buttons sichtbaren Element wie z.B. der `homeButton` positioniert werden.

.. note::

  Die Angabe der Position sollte in `em` erfolgen, da die in der Anwendung verwendeten Default-Werte ebenfalls in `em` angegeben sind. Siehe `em-Einheit <https://wiki.selfhtml.org/wiki/CSS/Wertetypen/Zahlen,_Ma%C3%9Fe_und_Ma%C3%9Feinheiten/em>`_

Der Abschnitt unterteilt sich in die Bereiche `mobile` und `desktop` da die Elemente Mobil andere Positionen haben müssen als in der Desktop Variante.

Für jedes Element kann der `top`- sowie der `left`-Wert überschrieben werden.

Im Folgenden sind die positionierbaren Elemente sowie deren `mobile`- und `desktop`-Standardpositionen aufgeführt.

  `desktop`
    `menuButton`
      - top: 0.5em
      - left: 0.5em
    `zoomButtons`
      - top: 2.7em
      - left: 0.5em
    `geolocationButton`
      - top: 6.5em
      - left: 0.5em
    `homeButton`
      - top: 8.5em
      - left: 0.5em
    `serviceButton`
      - top: 10.5em
      - left: 0.5em
    `serviceMenu`
      - top: 10.5em
      - left: 3.5em
    `rotationButton`
      - top: 12.5em
      - left: 0.5em
    `endMeasureButton`
      - top: 17.0em
      - left: 4.0em
    `pointMeasureResult`
      - top: 14.5em
      - left: 3.5em
  `mobile`
    `menuButton`
      - top: 0.5em
      - left: 0.5em
    `zoomButtons`
      - top: 3.2em
      - left: 0.5em
    `geolocationButton`
      - top: 8.1em
      - left: 0.5em
    `homeButton`
      - top: 10.8em
      - left: 0.5em
    `serviceButton`
      - top: 13.5em
      - left: 0.5em
    `serviceMenu`
      - top: 13.5em
      - left: 3.5em
    `rotationButton`
      - top: 16.2em
      - left: 0.5em
    `endMeasureButton`
      - top: 17.0em
      - left: 4.0em
    `pointMeasureResult`
      - top: 14.5em
      - left: 3.5em

Beispielhafte Positionierung des `homeButton`::

  componentPositions:
    desktop:
      menuButton:
        top: 1em
        left: 1em
    mobile:
      menuButton:
        top: 1.5em
        left: 0.5em


.. _defaultconf_communication:

communication
-------------

In diesem Abschnitt werden die Konfigurationen der PostMessage Schnittstelle mitsamt der Referenzierung der JavaScript
Plugins vorgestellt.

Munimap stellt eine Schnittstelle bereit, die mittels `PostMessage <https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>`_
erlaubt, gewisse Teile der Anwendung von einer aufrufenden Anwendung heraus, zu steuern. Dies kann bspw. nützlich sein,
wenn Munimap als IFrame in eine andere Anwendung eingebunden wurde, und diese Anwendung auf Ereignisse innerhalb von Munimap
reagieren möchte.

Folgende Konfigurationsoptionen werden unterstützt:

  ``allowedUrls``
    Liste von Urls die mittels PostMessage kommunizieren dürfen. Dabei folgt der Url-Abgleich anhand der Origins, wonach
    das Protokoll, die Domain und der Port der Url übereinstimmen müssen. Weitere Angaben zur Url (bspw. ``/foo?bar=baz``)
    sind nicht zulässig. Diese Konfiguration ist verpflichtend.

    Beispiel::

      communication:
        allowedUrls:
          - 'http://www.foo.bar'
          - 'http://www.foo.bar:80'
          - 'https://www.foo.bar'
          - 'https://www.foo.bar:443'
          - 'https://www.foo.bar:8080'

  ``plugins``
    Liste der JavaScript Plugins, die auf die erhaltenen PostMessage Events reagieren sollen. Die Referenz
    wird über den Namen des JavaScript Plugins hergestellt. Eine genaue Beschreibung zum Erstellen dieser Plugins
    findet sich unter :ref:`JavaScript Plugins <javascript_plugins>`. Sollten mehrere Plugins auf das gleiche
    PostMessage-Event hören, wird ausschließlich das zuletzt registrierte Plugin für das jeweilige Event ausgeführt.

    Beispiel::

      communication:
        allowedUrls:
          - 'http://www.foo.bar'
        plugins:
          - 'zoomToBbox' # Referenziert JavaScript Plugin mit dem Namen 'zoomToBbox'


printConfig
-----------

In diesem Abschnitt werden die Konfigurationen des Druck-Moduls vorgestellt.

  ``chooseCells``
    Erlaubt dem Benutzer die Gittergröße anzugeben.

  ``chooseStreetIndex``
    Erlaubt dem Benutzer, wahlweise einen Straßenindex mit zu exportieren.

  ``downloadPrefix``
    Text der dem Dateinamen des Resultats vorangestellt werden soll.

  ``pageResize``
    Ändern der Größe des Druckbereichs in der Karte erlauben. Standardwert `false`.

  ``outputFormats``
    Definiert die Liste mit Ausgabeformaten des Kartenbildes, die vom Benutzer ausgewählt werden können. Es können folgende Parameter angegeben werden:

    ``label``
        Angezeigter Name des Ausgabeformats in der Auswahlliste

    ``value``
        Dateiendung des Ausgabeformats. Z.B. `png`

    ``mimetype``
        Internet Media Type des Ausgabeformates. Siehe `MIME-Typen <https://wiki.selfhtml.org/wiki/Referenz:MIME-Typen>`_


Beispiel::

    outputFormats: [
        {
            'label': 'PDF',
            'value': 'pdf',
            'fileEnding': 'pdf',
            'mimetype': 'application/pdf'
        },
        {
            'label': 'PNG',
            'value': 'png',
            'fileEnding': 'png',
            'mimetype': 'image/png'
        }
    ]

  ``defaultScale``
    Anfänglich ausgewählter Maßstab. Dieser muss in `availableScales` definiert worden sein.

  ``availableScales``
    Liste mit Maßstäben, in denen die Karte exportiert werden kann.

  ``pageLayouts``
    Liste von Seitenformaten, die dem Benutzer für den Export zur Verfügung stehen sollen. Seitenformate müssen im Abschnitt `availablePageLayouts` konfiguriert worden sein.

``availablePageLayouts``
""""""""""""""""""""""""

Definitionen der verfügbaren Seitengrößen für den Export. Anzugeben mit `name`: `pageLayout`. Der `name` eines `pageLayouts` muss der Definition in der `mapfish.yaml` entsprechen, wobei im `name` vorkommende `-` Zeichen durch `\_` ersetzt werden.


  ``label``
      Angezeigter Name des Seitenformats.

  ``icon``
      Icon, die für das Seitenformat angezeigt werden soll. Hierbei ist `glyphicon-resize-vertical` für Hochformate und `glyphicon-resize-horizontal` für Querformate zu wählen. Im Prinzip können aber alle `Bootstrap Glyphicons <http://getbootstrap.com/components/#glyphicons>`_ verwendet werden.

  ``mapSize``
      Breite und Höhe der Karte, die in das exportierte Dokument eingebettet wird. Entspricht den Werten für `height` und `width` im jeweiligen `mapConfig` Block der `mapfish.yaml`. Angabe in Pixel als liste.


Beispiel::

  availablePageLayouts:
    "a0-portrait":
        label: A0
        icon: "glyphicon-resize-vertical"
        mapSize: [2344, 3310]


geolocationConfig
-----------------

In diesem Abschnitt werden die Konfigurationen des Geolocation-Moduls vorgestellt.

  ``tracking``
      Fragt die aktuelle Geoposition des Anwenders beim Aufruf der Anwendung ab und zentriert die Karte auf diese. Mögliche Werte sind `True` und `False`. Standard ist `True`.

  ``zoom``
      Detailstufe, die nach erfolgreicher Ermittlung der Geoposition eingestellt wird. Ist `zoom` nicht angegeben, erfolgt keine Veränderung der Detailstufe.

  ``resultVisible``
      Zeit in Millisekunden, nach der der Ergebnismarker automatisch verschwindet. Wenn 0 angegeben wird, verschwindet der Marker erst durch Anklicken. Der Standardwert beträgt 5000 Millisekunden.

  ``resultMarker``
    Darstellungsoptionen des Ergebnismarkers. Mit `graphicFile` kann die zu verwendende Grafik angegeben werden. Außerdem stehen die Optionen `graphicWidth`, `graphicHeight`, `graphicYAnchor` und `graphicScale` zur Verfügung. Eine genauere Beschreibung dieser Optionen finden Sie unter :ref:`Style <style>`.

  ``style``
    Darstellungsoptionen für den Abweichungsbereich der ermittelten Position. Es können alle Flächen- und Linienoptionen verwendet werden, die unter :ref:`Style <style>` beschrieben sind.


searchConfig
------------

In diesem Abschnitt werden die Konfigurationen des Such-Moduls vorgestellt.


  ``selected``
      Definiert die Standardsuche. Wenn mehrere Suchen definiert sind, wird diese als erste, aktive Suche verwendet. Werte `true` oder `false`.

  ``zoom``
      Detailstufe, die nach Auswahl eines Ergebnisses eingestellt wird. Ist `zoom` nicht angegeben, erfolgt keine Veränderung der Detailstufe.

  ``geocoder``
      Zu verwendender Geocoder. Eine Liste der zur Verfügung stehenden Geocoder finden Sie im Abschnitt `Geocoder`_.

  ``geocoderOptions``
      Spezifische Optionen des ausgewählten Geocoders. Welche Optionen der ausgewählte Geocoder benötigt bzw. bereitstellt finden Sie im Abschnitt `Geocoder`_.

  ``resultMarkerVisible``
      Zeit in Millisekunden, nach der der Ergebnismarker automatisch verschwindet. Wenn 0 angegeben wird, verschwindet der Marker erst durch Anklicken. Der Standardwert beträgt 5000 Millisekunden.

  ``resultMarker``
      Darstellungsoptionen des Ergebnismarkers. Mit `graphicFile` kann die zu verwendende Grafik angegeben werden. Außerdem stehen die Optionen `graphicWidth`, `graphicHeight`, `graphicYAnchor` und `graphicScale` zur Verfügung. Eine genauere Beschreibung dieser Optionen finden Sie unter :ref:`Style <style>`.

  ``urlMarkerColor``
      Definiert die Farbe, mit der die Url-Marker Definition der Url hinzugefügt wird. Die Farbdefinition wird als Hex-Wert ohne führendes `#` angegeben. Weitere Informationen zur Konfiguration der Url-Marker finden sich im Abschnitt :ref:`Url-Marker Konfiguration <url_marker_config>`.

  ``autoSearchChars``
      Definiert ab welchem Buchstaben die Autovervollständigung der Suche aktiviert wird. Wir der Wert auf 0 gesetzt, findet keine Autovervollständigung statt.

  ``availableInSearchBox``
      Wenn der Wert auf `false` gesetzt wird, ist die Konfiguration in der Suchbox nicht verfügbar. Default `true`.

  ``availableInUrlGeocode``
      Wenn der Wert auf `true` gesetzt wird, ist die Konfiguration über das URL-Geocode verfügbar. Default `false`.


digitizeConfig
--------------

In diesem Abschnitt werden die Konfigurationen des Digitize-Moduls vorgestellt.


  ``layers``
    Eine Liste der Namen der für die Anwendung bereitzustellenden Digitalisierungslayer. Diese Layer können in der Anwendung editiert werden.
    Es sind ausschließlich Layer des Typs `digitize` erlaubt. Siehe dazu auch :ref:`digitize<digitizesource>`. Aktuell
    wird das Editieren von genau einem Digitalisierungslayer unterstützt. Dieser Wert ist verpflichtend, wenn `components.digitize: True` ist.

Geocoder
""""""""

Für die Suche nach Orten werden folgende Geocoder unterstützt

Nominatim
'''''''''

Suche nach Orten über OpenStreetMap Daten. Siehe `Nominatim <http://wiki.openstreetmap.org/wiki/DE:Nominatim>`_.

``geocoderOptions``
```````````````````

  ``viewbox``
    Bereich, in dem gesucht werden soll. Koordinatenangabe in EPSG:4326

  ``url``
    Url zum Geocoder.

  ``method``
    Anfrage-Methode des HTTP-Requests. Muss auf `post` stehen.

  ``key``
    API-Key, wenn vorhanden.

  ``limit``
    Anzahl zurückgelieferter Ergebnisse

Solr
''''

Suche nach Orten über Apache Solr.

``geocoderOptions``
```````````````````
  ``url``
    Url zum Geocoder.

  ``method``
    Anfrage-Methode des HTTP-Requests. Muss auf `post` stehen.


    Beispiel::

        - name: adress_search
          title: Adresse
          availableInUrlGeocode: true
          availableInSearchBox: false
          geocoder: Solr
          selected: true
          geocoderOptions:
              viewbox:
                  - 8.34154267980772
                  - 51.905836372029
                  - 8.72247497339103
                  - 52.1276204795065
              url: "/search/?maxresults=20"
              method: get
          zoom: 14
          resultMarkerVisible: 0
          urlMarkerColor: E2001A
          autoSearchChars: 3
          resultMarker:
              graphicFile: 'geocoder-marker.svg'
              graphicWidth: 32
              graphicHeight: 50
              graphicYAnchor: 50
              graphicScale: 0.75

Catalog
'''''''

Suche nach Orten über den Kunden eigenen Catalog-Dienst.

``geocoderOptions``
```````````````````
  ``url``
    Url zum Geocoder.

  ``method``
    Anfrage-Methode des HTTP-Requests. Muss auf `post` stehen.

  ``steps``
    Angabe einer Liste, welche Schritte nach und nach angefragt werden sollen.

    Beispiel::

      - name: flr_search_catalog
        title: Katalog-Suche Flurstück
        geocoder: Catalog
        selected: false
        geocoderOptions:
            steps:
              - getgemarkungen
              - getflure
              - getflurstuecke
            viewbox:
              - 8.34154267980772
              - 51.905836372029
              - 8.72247497339103
              - 52.1276204795065
            url: "/search/"
            method: get
        zoom: 14
        resultMarkerVisible: 0
        urlMarkerColor: E2001A
        autoSearchChars: 1
        resultMarker:
            graphicFile: 'geocoder-marker.svg'
            graphicWidth: 32
            graphicHeight: 50
            graphicYAnchor: 50
            graphicScale: 0.75

Url Marker
----------

Es ist möglich Marker oder sichtbare BBOXen über die Url der Kartenanwendung hinzuzufügen. Dazu muss an die Url zur Anwendung `#?marker=` angehängt werden. Für jeden in der Url definierten Marker ist eine der beiden Eigenschaften `coord` oder `bbox` anzugeben. Optional können zur Option `coord` noch `color` und `label` angegeben werden. Die Optionen `srs` und `fit` können sowohl zu `coord`, als auch zu `bbox` angegeben werden.

Beispiel Urls::

  [...]/stadtplan/#?marker=color:ff0000|label:foo|coord:8.53,52.01|srs:4326
  [...]/stadtplan/#?marker=bbox:467157,5768668,467295,5768602|srs:25832|fit:true

Nachfolgend werden die einzelnen Url Parameter erläutert:

  ``coord``
    Koordinate des Markers

  ``bbox``
    Ausdehnung der anzuzeigenden BBOX

  ``color``
    Farbe des Markers

  ``label``
    Beschriftung des Markers

  ``srs``
    Koordinatensystem der Koordinaten. Kann ausgelassen werden, wenn die Koordinate im `defaultSrs`, welches über die App-Konfiguration festgelegt werden kann, vorliegt.

  ``fit``
    Wenn diese Option auf `true` gesetzt wird, wird die Karte beim initialen Aufrufen auf den Marker gezoomt. Diese Option wird danach aus der URL entfernt.

Es ist möglich mehrere Marker in der Karte über die Url zu platzieren. Hierzu werden einfach weitere `marker` in die Url geschrieben.

Beispiel für Url mit mehreren Markern::

  [...]/stadtplan/#?marker=color:ff0000|label:foo|coord:8.53,52.01&marker=color:0000ff|label:bar|coord:468152,5764386|srs:25832

Für das ``label`` stehen folgende Formatierungen zur Verfügung:

  ``[b]Text[/b]``
    Text wird fett
  ``[i]Text[/i]``
    Text wird kursiv
  ``[u]Text[/u]``
    Text wird unterstrichen
  ``Text[br]Text``
    Fügt einen Zeilenumbruch ein

Alle Formatierungen sind kombinierbar, so führt ``[b][i][u]Text[/u][/i][/b]`` zu fetten, kursiven, unterstrichen Text.


.. _url_marker_config:

Konfiguration
"""""""""""""

In diesem Abschnitt werden die Konfigurationen des UrlMarkers-Moduls vorgestellt.

  ``defaultSrs``
    Definiert das Default-Koordinatensystem, in dem Marker-Koordinaten in der Url angegeben werden können. Liegen die Koordinaten in diesem System vor benötigt der Marker in der Url keinen `srs`-Parameter

  ``propertiesDelimiter``
    Definiert das Trennzeichen zwischen den einzelnen Eigenschaften eines Markers. Defaultwert ist `|`

  ``keyValueDelimiter``
    Definiert das Trennzeichen zwischen Schlüssel und Wert einer Eigenschaft. Defaultwert ist `:`

  ``markerStyle``
    Darstellungsoptionen des Markers oder der BBOX. Mit `graphicFile` kann die zu verwendende Grafik angegeben werden. Damit das Einfärben des Markers über den Url-Parameter `color` funktioniert, muss es ein weißer (#ffffff) Marker sein. Sollte kein Popup für die Beschriftung des Markers verwendet werden, wird ein Label hinzugefügt. Dieses kann über die `font`-Optionen im Style angepasst werden. Eine genauere Beschreibung dieser Optionen finden Sie unter :ref:`Style <style>`.

  ``usePopup``
    Definiert, ob ein Popup für die Darstellung des Marker-Labels verwendet werden soll. Wird kein Popup verwendet wird ein normaler Text zu dem Marker angezeigt. Das Aussehen des Textes kann über die `font`-Optionen im Style angepasst werden.

  ``popupOffset``
    Definiert den Offset des Popups zum Marker und ist als Liste anzugeben. Der erste Wert definiert den Offset in X-Richtung, der zweite Wert definiert den Offset in Y-Richtung


.. _alkis_information:

ALKIS Informationen
-------------------

Benutzerberechtigung
""""""""""""""""""""

Sind die ALKIS-Module simple, selection und pdf in einer App aktiviert, werden diese auch immer angezeigt und liefern grundsätzlich eine Auskunft ohne Eigentümer (Die Benutzer müssen nicht in der Gruppe ALKIS_OHNE_EIGENTUEMER sein). Zum Anfordern des Tokens soll hier immer der Benutzer guest verwendet werden.

Ist der Benutzer in der Gruppe ALKIS_EIGENTUEMER eingetragen, liefern diese ALKIS-Module eine Auskunft mit Eigentümer.

Ist das ALKIS-Modul official in einer App aktiviert, steht dieses jedoch nur zur Verfügung bzw. ist sichtbar, wenn der Benutzer in der Gruppe ALKIS_EIGENTUEMER_IBR eingetragen ist.

Berechtigtes Interesse
""""""""""""""""""""""

Manchmal ist es erforderlich, dass der Benutzer bei Verwendung der ALKIS-Module simple, selection und pdf sein berechtigte Interesse dokumentieren muss. Beim Aktivieren wird dafür ein Dialog angezeigt werden.

Diese Funktionsweise soll jedem Benutzer zur Verfügung stehen, der in der Gruppe ALKIS_BERECHTIGTES_INTERESSE ist.

Die letzten Eingabewerte des Dialogs zu Firma, Sachbearbeiter und Art des berechtigten Interesses werden im Local Storage des Browser gespeichert und beim Aufruf des Benutzers wieder geladen.

Sobald von einem Modul „Informationen zum Flurstück“, „Liste der Produkte“ oder „ibR ALKIS-Produkte“ aufgerufen wird, ist ein Logdatensatz in einer Logdatei auf dem Server zu schreiben.

Konfiguration munimap.conf
""""""""""""""""""""""""""

Um ALKIS-Dienste nutzen zu können, müssen die IP Syscon ALKIS-Dienste vorliegen. In der munimap.conf Datei müssen die folgenden Parameter belegt werden.

::

    ALKIS_SESSION_URL = 'https://[alkis-session-url]?'
    ALKIS_INFO_URL = 'https://[alkis-info-url]/'
    ALKIS_PDF_URL = 'https://[alkis-pdf-url]?'

    ALKIS_BASE_URL = 'https://[alkis-base-url]'
    ALKIS_OFFICIAL_URL = 'https://[alkis-official-url]?'

    ALKIS_GML_WMS = '[alkis-wms-url]'

    ALKIS_LEGITIMATION_GROUP = 'ALKIS_BERECHTIGTES_INTERESSE'
    ALKIS_WITH_OWNER_GROUP = 'ALKIS_EIGENTUEMER'
    ALKIS_WITH_OWNER_OFFICIAL = 'ALKIS_EIGENTUEMER_IBR'

    ALKIS_WFS_URL = 'https://[alkis-wfs-url]?'


.. _context_menu:


Kontextmenü
-----------

Das Kontextmenü wird ein einem eigenen Template definiert, das über die Konfigurationsoption `contextMenu` gesteuert wird. Es wird nur angezeigt, wenn die Komponente aktiviert ist. Alle Einträge die in der Variable ``contextmenuItems`` enthalten sind, werden angezeigt.


Beispiel::

  let contextmenuItems = [{
      text: 'Starte OpenStreetMap',
      title: 'Startet OpenStreetMap an dieser Koordinate',
      link: true,
      callback: startOSM
    }
  ];

  function startOSM(obj) {
    let zoom = obj['zoom'] + 4
    let url = 'https://www.openstreetmap.org/#map=' + zoom +
      '/' + obj['coordinates']['EPSG:4326'][1] +
      '/' + obj['coordinates']['EPSG:4326'][0]
    return url;
  }


geoeditorConfig
---------------

In diesem Abschnitt werden die Konfigurationen des geoEDITOR-Moduls vorgestellt.

  ``geometries``
    Konfiguration der erlaubten Geometrien (`point`, `line`, `poylgon`). Für jeden Geometrietyp können folgende Subattribute konfiguriert werden:

    ``enabled``
      Definiert ob eine Geometrie erlaubt ist. Standardwert: `true`.

    ``min``
      Minimale Anzahl erlaubter Geometrien. Standardwert: `0`.

    ``max``
      Maximale Anzahl erlaubter Geometrien. Standardwert: unbegrenzt.

    Beispiel::

      geoeditor:
        geometries:
          point:
            enabled: true
            min: 1
            max: 5
          line:
            enabled: false
          polygon:
            max: 3

  ``style``
    Darstellungsoptionen für die verschiedenen Geometrietypen. Es können alle Flächen-, Linien- und Punktoptionen verwendet werden, die unter :ref:`Style <style>` beschrieben sind.
    Die hier angegebenen Darstellungsoptionen überschreiben lediglich die Standardwerte für die jeweilige Option, sodass andere Standardwerte weiterhin gelten.

    ``point``
      Darstellungsoptionen für Punkte.

    ``line``
      Darstellungsoptionen für Linien.

    ``polygon``
      Darstellungsoptionen für Polygone.

    Beispiel::

      geoeditor:
        style:
          point:
            radius: 30
          line:
            strokeColor: 'green'
          polygon:
            fillColor: 'red'

  ``formFields``
    Liste der Datenfelder und der dazugehörigen Datentypen für die unterschiedlichen Geometrietypen.
    Für jeden Geometrietyp (``point``, ``line``, ``polygon``) gibt es eine eigene Liste der Datenfelder.
    Folgende Subattribute müssen/können für ein Datenfeld konfiguriert werden:

    ``name``
      Der Name des Datenfelds. Dieser muss eindeutig sein und darf nicht mehrfach vergeben werden. Er sollte möglichst keine Leerzeichen und Sonderzeichen außer ``-`` oder ``_`` enthalten.

    ``label``
      Das Label des Datenfelds. Dies ist der Text, der neben/über dem Eingabefeld erscheint.
      Wenn kein Label angegeben ist, wird der ``name`` des Feldes verwendet.

    ``type``
      Der Datentyp des Datenfelds. Erlaubte Werte sind `"text"` für Texte, `"int"` für ganze Zahlen, `"float"` für Dezimalzahlen,
      `"boolean"` für boolesche Werte, `"date"` für Datumseinträge und `"select"` für Auswahllisten.

    ``select``
      Enthält die Auswahllistenkonfiguration. Dieser Wert wird nur berücksichtigt, wenn als ``type`` `"select"` angegeben wurde.
      Kann entweder eine Liste der verfügbaren Optionen mit den Eigenschaften ``value`` und ``label`` oder einen Verweis auf eine ausgelagerte Selektionskonfiguration enthalten.
      Weitere Details dazu sind unter :ref:`Auswahllisten-Definition<selectionlistconf>` beschrieben.
      Wenn für eine Option kein ``label`` angegeben ist, wird der ``value`` der Option verwendet.

    ``required``
      Beschreibt, ob es sich um ein verpflichtendes Feld handelt. Standardwert: `false`.

    Beispiel::

      geoeditor:
        formFields:
          point:
            - name: "mein-textfeld"
              label: "Mein Textfeld'
              type: "text"
              required: true
            - name: "mein-ganzzahlfeld"
              label: "Mein Ganzzahlfeld"
              type: "int"
            - name: "mein-dezimalzahlfeld"
              type: "float"
            - name: "mein-auswahllistenfeld"
              type: "select"
              select:
                - value: "first"
                  label: "Erste Auswahl"
                - value: "second"
                  label: "Zweite Auswahl"
          line:
            - name: "line-feld"
              type: "text"
          polygon:
            - name: "auswahl-referenz"
              type: "select"
              select: "referenzierte_auswahl_konfiguration"

  ``allowedUrls``
    Whitelist der URLs, die die PostMessage Schnittstelle des geoEDITORs verwenden dürfen. Standardwert: Leere Liste oder ``communication.allowedUrls``, falls angegeben.

    Beispiel::

      geoeditor:
        allowedUrls:
          - "www.example.com"
          - "www.my-domain.org:8080"

    Folgende PostMessage Schnittstellen stehen zur Zeit für den geoEDITOR zur Verfügung:

      ``finishGeoEditing``
        Validiert die eingezeichneten Geometrien und Formulareingaben, und gibt die entsprechenden Werte zurück.

        Folgende Eingabeparameter können der Methode angehängt werden:

        ``srs``
          Projektion in die das ausgelieferte GeoJSON transformiert wird. Das GeoJSON ist an dieser Stelle nicht mehr
          konform zur Spezifikation, dies muss ggf. in verarbeitender Software beachtet werden. Standardwert: ``'EPSG:4326'``

        Bei erfolgreicher Validierung antwortet die Schnittstelle mit einem ``finishGeoEditing_response`` Event, welches
        ein Objekt mit folgenden Attributen zurückliefert:

        ``success``
          Der Erfolgsstatus der Schnittstelle. Bei erfolgreicher Validierung ist dieser Wert immer ``true``.

        ``geoJSON``
          geoJSON Objekt, welches die gezeichneten Geometrien in EPSG:4326 enthält. Die eingetragenen Formulardaten
          sind der jeweiligen Geometrie unter dem Attribut ``properties`` angehängt. Der Style der jeweiligen
          Geometrie ist unter dem Attribut ``properties.style`` angehängt.

        Bei erfolgloser Validierung antwortet die Schnittstelle mit einem ``finishGeoEditing_response`` Event, welches
        ein Objekt mit folgenden Attributen zurückliefert:

        ``success``
          Der Erfolgsstatus der Schnittstelle. Bei erfolgloser Validierung ist dieser Wert immer ``false``.

        ``message``
          Eine Fehlernachricht mit konkreten Informationen, wieso die Methode nicht erfolgreich ausgeführt werden konnte.

        ``missing``
          Eine Übersicht über die fehlenden Geometrietypen, falls dies der Grund für die fehlgeschlagene Validierung war.

      ``printGeoEditing``
        Triggert den Druck der gezeichneten Geometrien, falls diese valide sind.

        Folgende Eingabeparameter können der Methode angehängt werden:

        ``layout``
          String, der das Layout des Drucks beschreibt. Standardwert: ``a4-portrait``.

        ``margin``
          Der Abstand zwischen der äußersten Geometrie und dem Kartenrand. Standardwert: ``20``.

        ``outputFormat``
          Das Ausgabeformat des Drucks. Standardwert: ``pdf``.

        ``minScale``
          Der minimale Maßstab. Standardwert: ``100``.

        Bei erfolgreicher Ausführung antwortet die Schnittstelle mit einem ``printGeoEditing_response`` Event, welches
        ein Objekt mit folgenden Attributen zurückliefert:

        ``success``
          Der Erfolgsstatus der Schnittstelle. Bei erfolgreichem Druck ist dieser Wert immer ``true``.

        ``statusURL``
          Unter dieser URL kann der Status des Drucks abgefragt werden. Liefert ein JSON Objekt. Wenn dort ``status``
          den Wert ``'finished'`` hat, steht der Druck unter dem Attribut ``downloadURL`` zu Verfügung.

        ``downloadUrl``
          Die Url zum erstellten Dokument. Der Download ist erst fertig, wenn die ``statusURL` den Status ``finished`` zurück gibt.
          Wenn in der App der Print Broker nicht aktiviert ist, wird das ``printGeoEditing_response`` Event immer
          erst gefeuert, wenn der Druck fertig ist.
          Der Download wird in munimap in einem Verzeichnis für temporäre Daten gespeichert, daher wird empfohlen die Datei
          zu persistieren sobald diese zu Verfügung steht.

        Bei erfolgloser Ausführung antwortet die Schnittstelle mit einem ``printGeoEditing_response`` Event, welches
        ein Objekt mit folgenden Attributen zurückliefert:

        ``success``
          Der Erfolgsstatus der Schnittstelle. Bei erfolglosem Druck ist dieser Wert immer ``false``.

        ``message``
          Eine Fehlernachricht mit konkreten Informationen, wieso der Druck nicht erfolgreich ausgeführt werden konnte.


  ``customStyling``
    Legt fest, ob Anwender die Geometrien eigenständig stylen dürfen. Erlaubte Werte sind ``true`` und ``false``. Standardwert: ``false``.

    Beispiel::

      geoeditor:
        customStyling: true

  ``displayMeasurements``
    Legt fest, ob die Echtzeitanzeige für Flächengröße und Linienlänge aktiviert werden soll. Erlaubte Werte sind ``true`` und ``false``. Standardwert ``false``.

    Beispiel::

      geoeditor:
        displayMeasurements: true

  ``drawTitle``
    Legt den Titel des Drawers fest.

  ``modifyLabel``
    Legt die Beschriftung des 'Ändern'-Buttons fest.

  ``removeLabel``
    Legt die Beschriftung des 'Löschen'-Buttons fest.
