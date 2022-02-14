Straßenindex
============

Die Straßenindizes werden beim Druckexport automatisch als PDF erzeugt und mit dem Druckergebnis in einer ZIP Datei ausgeliefert.

Die Indizes können auch manuell Abgerufen werden. Hierfür steht die URL ``/index.FORMAT`` zur Verfügung. Folgende Parameter werden unterstützt:

    ``layers``
      Für den Straßenindex muss hier ``street_labels`` verwendet werden. Es können aber auch andere PostGIS Layer angegeben werden.

    ``srs``
      25832 für UTM-32

    ``width`` und ``height``
      Breite und Höhe des Exports. Genaue Werte spielen zur Zeit keine Rolle.

    ``cellx`` und ``celly``
      Die Anzahl der Gitterzellen in X- und Y-Richtung.

    ``bbox``
      BBOX des Exports.

    ``limit``
      Maximale Anzahl an Einträgen im Index. Sollte für einen vollständigen Stadtplanindex bei mindestens 10000 liegen.



Als Format werden PDF, JSON und CSV unterstützt. Die URLs lauten jeweils ``/index.pdf``, ``/index.json`` und ``/index.csv``.

Beispielaufruf::

    /index.csv?layers=street_labels&srs=25832&height=100&width=100&
    cellsy=23&cellsx=20&bbox=457000,5751000,476000,5773000&limit=10000