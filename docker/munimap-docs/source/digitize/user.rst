.. _digitize_user:

Digitalisieren
##############

Mit Hilfe des Digitalisier-Moduls können Informationen auf der Karte eingezeichnet werden, die  anschließend den Besuchern der Anwendung in einem extra Layer angezeigt werden.

Hierzu stellt das Digitalisier-Modul eine Reihe von Funktionen bereit die das Zeichnen und Bearbeiten von Geometrien sowie die Zuweisung von Eigenschaften und Aussehen ermöglicht.

Die Oberfläche zum Digitalisieren kann unter https://[host]/digitize/ aufgerufen werden. Nach erfolgreichem Login kann ein entsprechender Layer ausgewählt und bearbeitet werden.

Benutzer die als Administrator für die Digitalisierungsfunktion zuständig sind können noch weitere Einstellungen vornehmen. Bitte lesen Sie hierzu :doc:`admin`.

Die Funktionalität des Digitalisier-Moduls ist in der dazugehörigen Kartenanwendung untergebracht. Die Funktionen zum Editieren finden sich in der Seitenleiste der Anwendung. Diese kann über das gewohnte Symbol geöffnet werden.

Die Seitenleiste unterteilt sich in die Bereiche `Hintergrundkarten`, `Themenkarten`, `Gruppen` und `Zeichnen`.

Aufbau
------

Für die Digitalisierung besteht eine Karte aus mehreren Gruppen. Jede Gruppe kann einzeln bearbeitet und aktiviert werden. Innerhalb einer Gruppe können zusammengehörige Objekte, z.B. eine Baustelle mit Umleitung, zusammengefasst eingezeichnet werden.

Damit nicht alle Änderungen sofort für die Besucher der Webanwendung sichtbar sind verfügen die Gruppen über die Möglichkeit einzeln aktiv geschaltet zu werden. Das Aktivieren einer Gruppe wird durch einen Administrator durchgeführt.

Gruppen die bereits in der Anwendung für die Besucher sichtbar sind werden über einen Warnhinweises als "Aktiv" gekennzeichnet. Bitte achten Sie darauf, dass beim Bearbeiten einer aktiven Gruppe alle Änderungen in der Live-Anwendung sichtbar sind.


``Gruppen``
"""""""""""

Durch das Anklicken eines Gruppentitels wird eine Gruppe ein- bzw. ausgeblendet. Ausgeblendete Gruppen können nicht editiert werden.

Um eine Gruppe zu bearbeiten muss das Editier-Modul ausgewählt werden.

Über das Ausdehnungs-Symbol kann die Karte auf die Ausdehnung der Gruppe zentriert werden. Sind keine Geometrien der Gruppe vorhanden ist die Fläche ausgegraut.


``Zeichnen``
""""""""""""

Um in der Karte zu editieren muss im ersten Schritt die gewünschte Gruppe ausgewählt werden in der editiert werden soll.

Hierzu muss die Schaltfläche mit dem Stift-Symbol neben der gewünschten Fläche betätigt werden. Anschließend wird die `aktive Gruppe` im `Zeichnen`-Reiter angezeigt und kann bearbeitet werden.

Neues Objekt einzeichnen
------------------------

Im Reiter `Zeichnen` sind unter der Überschrift `Geometrie hinzufügen` die Schaltflächen `Punkt`, `Linie`, `Polygon` und `Text` abgebildet.  Über diese wird das Zeichnen des entsprechenden Geometrietyps in der Karte aktiviert. Durch Klicken auf der Karte wird dann das Objekt erzeugt.

Nachdem eine Geometrie eingezeichnet wurde erscheint eine Callout-Box in dem die Eigenschaften und das Aussehen der gezeichneten Geometrie eingestellt werden können. Eine Auflistung welche Eigenschaften eingestellt werden können ist unter `Geometrieeigenschaften und Darstellung`_ zu finden.

Für das Zeichnen von weiteren Objekten ist dann wieder der gewünschte Geometrietyp in der Seitenleiste zu wählen.


Einstellungen bearbeiten
------------------------

Damit ein Objekt bearbeitet werden kann muss die Gruppe des Objektes als aktive Gruppe ausgewählt sein. Anschließend kann das gewünschte Objekt mittels anklicken ausgewählt werden.

Nach Auswahl der Geometrie öffnet sich ein Pop-Up in dem die Eigenschaften und das Aussehen der Geometrie bearbeitet werden können.

Eine Auflistung welche Eigenschaften bearbeitet werden können ist unter `Geometrieeigenschaften und Darstellung`_ zu finden.

Geometrieform bearbeiten
------------------------

Damit das Objekt an sich bearbeitet werden kann muss die Gruppe des Objektes als aktive Gruppe ausgewählt sein.

Unter der Überschrift `Geometrie bearbeiten oder verschieben` befindet sich eine Schaltfläche über die das Bearbeiten aktiviert bzw. deaktiviert werden kann.

Ist die Funktion aktiv, kann durch einen Klick auf die Geometrie diese ausgewählt werden. Die ausgewählte Geometrie wechselt ihr Aussehen um anzuzeigen, dass sie bearbeitet wird.  Punkte und Texte können jetzt verschoben und die Linienführung von Linien und Polygonen verändert werden.

Neue Stützpunkte von Linien oder Polygonen können durch einfaches anklicken der Linie an dem gewünschten Punkt gesetzt werden. Das Löschen eines Stützpunktes ist durch Anklicken von diesem möglich.

Sind alle Änderungen abgeschlossen ist durch erneutes Betätigen der Schaltfläche das Zeichnen wieder deaktiviert.

Objekt löschen
--------------

Wählen Sie die Geometrie die gelöscht werden soll per Klick aus. Geometrien der aktiven Gruppe können per Linksklick ausgewählt werden.

Nach Auswahl einer Geometrie öffnet sich die Callout-Box in dem die Eigenschaften und das Aussehen der Geometrie bearbeitet werden können. Das Löschen der Geometrie kann hier  über `Geometrie löschen` durchgeführt werden.

Änderungen speichern
--------------------

Änderungen werden nicht automatisch gespeichert und müssen durch den Benutzer bestätigt werden.

Sobald Änderungen vorhanden sind, wird die Speichern-Schaltfläche aktiviert. Durch betätigen dieser werden alle Änderungen aller bearbeiteten Gruppen dauerhaft gespeichert.


Geometrieeigenschaften und Darstellung
--------------------------------------

Nach dem Auswählen einer Geometrie oder dem Zeichnen einer Geometrie öffnet eine Callout-Box über die die Eigenschaften und das Aussehen der ausgewählten Geometrie bearbeitet werden können.

Die Callout-Box ist in mehrere vom Geometrietyp abhängige Bereiche unterteilt. Über die Schaltflächen auf der linken Seite der Callout-Box kann zwischen diesen Bereichen gewechselt werden.

Alle Änderungen wirken sich sofort auf die Geometrie in der Karte aus.


``Eigenschaften``
"""""""""""""""""

Im Bereich der Eigenschaften können Werte pro Objekt eingegeben werden. Alle Geometrien eines Layers besitzen die gleichen Eigenschaften. Diese können vom Administrator im Administrationsbereich festgelegt werden.

Dieser Bereich ist für alle Geometrietypen verfügbar.

``Darstellung``
"""""""""""""""

Über den Darstellungsbereich kann das Aussehen der Objekte bearbeitet werden. Dieser Bereich ist für Punkt-, Linien- und Polygon-Geometrien verfügbar.

Alle Geometrien eines Layers besitzen die gleiche Darstellung, welches pro Geometrie nach Wunsch überschrieben werden kann. Die Standard-Darstellung kann im Administrationsbereich angepasst werden. Je nach Geometrietyp können hier unterschiedliche Einstellungen vorgenommen werden. Diese sind im Folgenden aufgelistet.


    Linie
        Es können Linienfarbe, Deckkraft, Linienstärke und Linienart eingestellt werden. Für Punkte und Polygone betrifft diese Einstellung die Außenlinie.
        Diese Einstellungen sind für Punkt-, Linien- und Polygon-Geometrien verfügbar.


    Füllung
        Es können Flächenfarbe und Deckkraft eingestellt werden.
        Diese Einstellungen sind für Punkt- und Polygon-Geometrien verfügbar.

    Punkt
        Es kann der Radius des Punktes eingestellt werden.
        Diese Einstellung ist nur für Punkt-Geometrien verfügbar.

    Symbole
        Bei einem Punkt haben Sie zusätzlich noch die Möglichkeit ein Symbol anstelle eines Punktes auszuwählen. Wählen Sie den Reiter mit Marker-Symbol aus um den `Symbol`-Bereich zu öffnen. Dieser Bereich ist nur bei Punkten verfügbar.

        Solange einer Geometrie ein Symbol zugewiesen ist, können keine Einstellungen im `Darstellungsbereich <Darstellung>`_ vorgenommen werden. Die Zuweisung kann über die `Deselektieren`-Schaltfläche durchgeführt werden. Das Symbol kann rotiert werden.

        Die Größe eines Symbols kann nicht bearbeitet werden.

    Text
        Wählen Sie den Reiter mit dem Text-Symbol um den `Text`-Bereich zu öffnen. Dieser Bereich ist nur bei Texten verfügbar.

        Geben Sie hier den Text ein der in der Karte angezeigt werden soll. Zusätzlich können die Farbe, Schriftgröße sowie die Schriftstärke angepasst und der Text rotiert werden.
