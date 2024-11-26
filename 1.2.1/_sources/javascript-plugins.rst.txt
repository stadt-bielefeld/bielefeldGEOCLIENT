.. _javascript_plugins:

JavaScript-Plugins
##################

JavaScript Plugins ermöglichen das Erweitern der Munimap Anwendung um nutzergenerierte Funktionalität.
Hierdurch wird Administratoren die Möglichkeit gegeben, eigene JavaScript Funktionen zu erstellen und in Munimap einzubinden.
Die erzeugten Funktionen können ausschließlich mittels PostMessage getriggert werden.

Neues Plugin erstellen
----------------------

.. note::

  JavaScript Plugins können im Administrationsbereich erstellt werden. Dazu in der Seitennavigation auf den Reiter
  ``Plugins`` klicken.

Jedes Plugin muss folgende Konventionen einhalten:

* Ein Plugin muss immer die Funktion ``registerCommunicationPlugin('<eventName>', <PluginFunktion>)`` genau ein Mal aufrufen.
  Weitere Funktionsaufrufe sind nicht gestattet.
* Die Logik eines Plugins muss innerhalb der ``<PluginFunktion>`` definiert werden.
* Die PostMessage-Events ``munimapReady``, ``finishGeoEditing`` und ``printGeoEditing`` können nicht durch Plugins überschrieben werden.

Soll bspw. ein Plugin für das PostMessage-Event `zoomToBbox` erstellt werden, könnte dies folgendermaßen aussehen:

.. code-block:: javascript

  registerCommunicationPlugin('zoomToBbox', function(value, context, postMessage) {

    // Zoome auf die in value spezifizierte BoundingBox
    context.map.getView().fit(value.bbox);

    // Antworte der Anwendung, dass die Karte
    // jetzt genau auf den Ausschnitt der BoundBox ausgerichtet ist
    postMessage({
      action: 'zoomToBbox_response',
      value: {
        success: true
      }
    });

  });

registerCommunicationPlugin()
"""""""""""""""""""""""""""""

Diese Funktion registriert das Plugin für das angegebene PostMessage-Event. Jedes JavaScript Plugin darf
ausschließlich den Aufruf zu ``registerCommunicationPlugin()`` enthalten.

``registerCommunicationPlugin()`` hat folgende Funktionssignatur:

``registerCommunicationPlugin(eventName, eventFunction(value, context, postMessage))``.

  ``eventName``
    String. Die Referenz auf das zu lauschende PostMessage-Event.

  ``eventFunction``
    Die Funktion, die ausgeführt wird, wenn das PostMessage-Event ``eventName`` von einer aufrufenden Anwendung gefeuert wird.

    Folgende Argumente werden der Funktion hinzugefügt:

      ``value``
        Der Wert, der über PostMessage mitgesendet wurde. Die Struktur von ``value`` wird von der Anwendung spezifiziert,
        die das jeweilige PostMessage-Event feuert.

      ``context``
        Ein Objekt, welches Kontextvariablen der Munimap Anwendung bereitstellt. Dazu gehören:

          ``appName``
            Der Name der Munimap Anwendung

          ``map``
            Das Map-Objekt der Munimap Anwendung

          ``mapSrs``
            Das Koordinatenreferenzsystem der Munimap Anwendung

          ``olGeoJSON``
            Die OpenLayers GeoJSON format Klasse. Details in `OpenLayers Dokumentation <https://openlayers.org/en/v5.3.0/apidoc/module-ol_format_GeoJSON-GeoJSON.html>`_

          ``olWKT``
            Die OpenLayers WKT format Klasse. Details in `OpenLayers Dokumentation <https://openlayers.org/en/v5.3.0/apidoc/module-ol_format_WKT-WKT.html>`_

          ``ol``
            Vollständiger Zugriff auf alle OpenLayers Funktionalitäten. Details in `OpenLayers Dokumentation <https://openlayers.org/en/v5.3.0/apidoc/>`_

          ``LayersService``
            Der anol LayersService. Mit Hilfe von ``.addSystemLayer`` lassen sich Layer hinzufügen. Neue Layer können mit den anol Funktionalitäten erzeugt werden: `https://github.com/terrestris/anol/tree/master/src/anol/layer <https://github.com/terrestris/anol/tree/master/src/anol/layer>`_.

          ``MapService``
            Der anol MapService.

          ``DrawService``
            Der anol DrawService.

          ``PrintPageService``
            Der anol PrintPageService.

          ``PrintService``
            Der anol PrintService.

      ``postMessage``
        Eine Funktion, die aufgerufen werden kann um eine Antwort an die Anwendung zu schicken, die das PostMessage-Event
        gefeuert hat. Dies geschieht ebenfalls mittels PostMessage.
        ``postMessage`` erwartet als Argument ein Objekt mit folgenden Attributen:

          ``action``
            Der Name der PostMessage-Events, das gefeuert werden soll

          ``value``
            Ein Objekt mit beliebigem Inhalt, welches die Antwortdaten enthält


Plugins referenzieren
-------------------------------

JavaScript Plugins können in den App-Optionen unter ``communication`` durch ihren Pluginnamen referenziert werden.
Genaue Details dazu finden sich unter :ref:`Communication <defaultconf_communication>`.
