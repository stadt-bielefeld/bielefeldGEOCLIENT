
URL-Parameter
#############

Folgende URL-Parameter sind möglich:

  ``map``
    Muss genau 4 kommaseparierte Optionen haben: Zoomstufe, X-Koordinate, Y-Koordinate und das Koordinatensystem als EPSG Zeichenkette (z.B `EPSG:12345`).
    Die Karte wird auf diese Position ausgerichtet.

  ``layers``
    Enthält alle sichtbaren Layer als kommaseparierte Liste.

  ``visibleCatalogGroups``
    Kommaseparierte Liste.

  ``catalogLayers``
    Kommaseparierte Liste.

  ``visibleCatalogGroups``
    Kommaseparierte Liste.

  ``catalogGroups``
    Kommaseparierte Liste.

  ``fit``
    Muss genau 5 kommaseparierte Optionen haben, die eine BBOX beschreiben: MinX-Koordinate, MinY-Koordinate, MaxX-Koordinate, MaxY-Koordinate und das Koordinatensystem als EPSG Zeichenkette (z.B `EPSG:12345`).
    Die Karte wird auf diese BBOX ausgerichtet. Wenn `fit` gesetzt ist, wird `map` ignoriert (Empfehlung: kein `map` angeben, wenn `fit` angegeben wird). Der Parameter wird nach dem initialen Aufruf aus der URL entfernt um nicht das Permalink Verhalten auszuhebeln. Diese Option sollte nicht gleichzeitig mit der Option `fit:true` der URL Marker angegeben werden.

Geocode
-------

Mit dem Geocode Parameter können direkt Suchkonfigurationen angesprochen werden und die Karte beim Start auf ein Suchergebnis zentriert werden. Der Geocode Parameter muss mindestens einen Suchbegriff (`term`) enthalten. Nach der Suche wird der Parameter entfernt. Damit eine Suchkonfiguration verwendet werden kann muss diese mit dem Parameter `availableInUrlGeocode` konfiguriert werden.
Wenn mehrere Suchergebnisse gefunden werden, wird das erste gewählt. Wenn kein Suchergebnis gefunden wird, wird eine Fehlermeldung ausgegeben.
Beispiel::

  [...]/stadtplan/#?geocode=term:Altes Dorf 5
  [...]/stadtplan/#?geocode=term:Altes Dorf 5|config:adress_search|label:test [b]bold[/b]|highlight:true

Folgende Parameter sind möglich:

  ``term``
    Der Suchbegriff. Muss enthalten sein.

  ``config``
    Der `name` der zu verwendenden Suchkonfiguration. Wenn dieser nicht angegeben wird, wird die erste verwendbare Konfiguration genommen.

  ``highlight``
    Bei `true` wird das Suchergebnis auf der Karte angezeigt. Default `false`.

  ``label``
    Text der in einem Popover am Suchergebnis angezeigt wird. Default ist kein label.

In der App Konfiguration kann der Parameter `urlGeocodeNotFoundMessage` verwendet werden um die Nachricht einzustellen, die angezeigt wird, wenn kein Suchergebnis gefunden wird.
Wenn der Parameter auf `false` gesetzt wird, wird keine Nachricht in der Anwendung sondern nur in der Entwicklerkonsole angezeigt.
Wenn der Parameter auf einen Text gesetzt wird, wird dieser statt der Standardnachricht angezeigt.
