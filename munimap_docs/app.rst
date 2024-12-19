Anwendungen
===========

Munimap stellt eine Kartenanwendung bereit, die direkt unter ``/stadtplan`` erreichbar ist.
Zusätzlich können weitere Anwendungen (kurz Apps) konfiguriert werden, die z.B. nur eine kleinere Layerauswahl oder andere Komponenten beinhalten.


Mit Hilfe verschiedener Konfigurationsdateien können die Haupt- und Spezialanwendungen angepasst werden. Diese können über den Administrationsbereich bearbeitet werden.

Neue Anwendung erstellen
------------------------

Um eine neue Anwendung zu erstellen muss eine neue Konfigurationsdatei angelegt werden. Der Name der Konfigurationsdatei ist auch gleichzeitig Teil der URL unter der die Anwendung abgerufen werden kann.

Aus **schulweg.yaml** wird die Anwendung unter **/schulweg**

In der Konfiguration können alle Optionen angegeben werden die in der :ref:`App-Konfiguration <defaultconf>` definiert sind. Alle Optionen die nicht überschrieben werden, werden aus der Standard-Konfiguration (``default-config.yaml``) übernommen.

Im Folgenden eine umfangreiche beispielhafte Konfiguration einer Anwendung.


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
    components:
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


Digitize-App
------------

Der Endpunkt `/digitize`, unter dem in früheren Versionen die Digitalisierungsanwendung bereitgestellt wurde,
wurde in der aktuellen Version entfernt. Mittlerweile kann jede Anwendung für das Digitalisieren von Objekten
verwendet werden. Weitere Infos unter :ref:`App-Optionen<defaultconf>`.


Transport-App
-------------

Die Kartenanwendung für den ÖPNV ist unter `/mobiel` zu erreichen. Hierzu gehörig ist die Konfigurationsdatei `transport.yaml`.

In ihr können eingeschränkt Einstellungen vorgenommen werden, die auch in der Standard-Anwendung zur Verfügung stehen.


Statische Dateien und Templates
-------------------------------

Unter ``/opt/etc/munimap/bielefeld/`` befinden sich die Verzeichnisse ``static`` und ``templates``. Dort abgelegte Dateien werden von Munimap bevorzugt verwendet. So können z.B. Bilder und einzelne Seiten überschrieben werden.

So sind im Verzeichnis ``/opt/etc/munimap/bielefeld/templates/munimap/pages`` Dateien für die Nutzungsbedingungen und Info-Seiten abgelegt.

Außerdem kann die E-Mail, welche für das Passwort vergessen verschickt wird, hier abgelegt und geändert werden.

Das ``assets`` Verzeichnis wird intern verwendet und sollte nicht verändert werden.


Anwendung als IFrame einbinden
------------------------------

Die Kartenanwendung kann mit Hilfe eines IFrames auch innerhalb einer Webseite eingebunden werden. Hierzu ist die Url zur Kartenanwendung inklusive der Url-Parameter `map` und `layers` in das `src`-Attribut des IFrames einzutragen.

.. code-block:: html

    <iframe src="<Basis-Url>#?map=9,468420,5763801,EPSG:25832&layers=stadtplan_bi"
            style="width: 100%; height: 600px;"
            frameborder="0">
    </iframe>


Layout bearbeiten
-----------------

Das Layout der Anwendungen kann mit Hilfe der vorhandenen Sass-Dateien angepasst. Sass ist eine Stylesheet-Sprache die als Präprozessor die Erzeugung von CSS erleichtert. Ausführliche Informationen zu Sass sind auf der offiziellen `Homepage von Sass <http://sass-lang.com/>`_ zu finden.

Eines der Hauptunterschiede zu CSS sind die verschachtelten Regeln. Durch diese können komplexe Selektoren einfach gelesen und geschrieben werden. In dem Projekt wird die SCSS-Syntax verwendet. Das bedeutet, dass keine Klammern oder Semikolons gesetzt werden müssen wie dies etwa bei CSS nötig ist.

Beispiel

.. code-block:: css

    #header
      background: #FFFFFF

      .error
        color: #FF0000

      a
        text-decoration: none
        &:hover
          text-decoration: underline


Dies wird vom System kompiliert zu:

.. code-block:: css

    #header {
      background: #FFFFFF;
    }
    #header .error {
      color: #FF0000;
    }
    #header a {
      text-decoration: none
    }
    #header a:hover {
      text-decoration: underline
    }


``Pfad zu den Sass-Dateien``
""""""""""""""""""""""""""""

Die Sass-Dateien sind im Repository unter `conf/munimpa/project/frontend/sass` abgelegt und werden automatisch als CSS mit deployed, das generierte CSS kann ggf. im Image ausgetauscht werden durch einen Mount nach .


``variables.sass``
"""""""""""""""""""

Farbwerte, Abstände und auch Schriftgrößen die in der Anwendung verwendet werden, werden mit Hilfe von Variablen gesetzt. Sass ermöglicht es diese an einer Stelle zu definieren um diese dann wieder zu verwenden.

Die Variablen können dementsprechend überschrieben werden und sind gesammelt in der Datei ``variables.sass`` zu finden. Variablen werden mit einem führenden $-Zeichen definiert und müssen ihren Namespace als Prefix erhalten.

.. code-block:: css

    variables.$sidebar-text-color: #787878
    $other-sidebar-item-highlight-color: #ccc
