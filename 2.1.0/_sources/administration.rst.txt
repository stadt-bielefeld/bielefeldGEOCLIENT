Administrationsbereich
######################

Im Administrationsbereich können Gruppen, Layer, Karten, Projekte, Auswahllisten, Plugins und Benutzer verwaltet werden.

Gruppen und Benutzer werden in der Datenbank gespeichert.

Layer und Projekte werden aus den Karten-Konfigurationsdateien (im yaml Format) ausgelesen.

Gruppen können Layer, Projekte und Benutzer zugewiesen werden.

Layern, Projekten und Benutzern können Gruppen zugewiesen werden.

Layer und Projekte können abgesichert werden.


Hauptansicht
------------

In der Hauptansicht werden die Zuweisungen von Layern, Projekten und Benutzern zu Gruppen vorgenommen.

Die Zuweisung erfolgt über die Listenansicht in der Mitte der Anwendung.

Über die linke Liste kann das Element ausgewählt werden, für welches die Zuweisung bearbeitet werden soll.

In der mittleren Liste werden die dem Element aktuell zugewiesenen, in der rechten Liste die dem Element nicht zugewiesenen Element angezeigt.

Eine Zuweisung erfolgt, in dem in der rechten Liste der Button mit dem Pfeilsymbol betätigt wird.

Eine Zuweisung wird aufgehoben, in dem in der mittleren Liste der Button mit dem Pfeilsymbol betätigt wird.

Für Gruppen kann im oberen rechten Bereich ausgewählt werden, ob die Zuweisung von Layern, Projekten oder Benutzern bearbeitet werden soll.


Verwalten
---------

Unter der linken Liste ist der `Verwalten`-Button zu finden. Nach Betätigung wird in die Verwaltungsansicht der ausgewählten Kategorie gewechselt.

Gruppen
"""""""

In der Verwaltungsansicht für Gruppen können Gruppen hinzugefügt, bearbeitet und gelöscht werden.

Beim Erstellen oder Bearbeiten erscheint eine Eingabemaske, in der Name und Titel sowie eine Beschreibung zu der Gruppe angegeben werden muss. Name und Titel sind Pflichtfelder.


Layer
"""""

In der Verwaltungsansicht für Layer können Layer abgesichert, die Absicherung aufgehoben sowie Details zu einem Layer angezeigt werden.

Durch betätigen des `Absichern`-/`Absicherung entfernen`-Buttons wird der Layer abgesichert, bzw. die Absicherung aufgehoben. Durch betätigen des Buttons mit Pfeilsymbol werden die Details zu einem Layer angezeigt bzw. ausgeblendet.


Karten
""""""

In der Verwaltungsansicht für Karten werden per yaml-Konfigurationsdatei die Layer und Gruppen eingebunden, sowie FeatureInfo, Legende, Metadaten-URL etc. definiert.


Projekte
""""""""

In der Verwaltungsansicht für Projekte können Projekte abgesichert bzw. die Absicherung entfernt werden. Außerdem kann die zugehörige Anwendung aufgerufen werden.

Durch betätigen des `Absichern`-/`Absicherung entfernen`-Buttons wird das Projekt abgesichert, bzw. die Absicherung aufgehoben.

Durch betätigen des Anwendung `Anzeigen`-Buttons wird die jeweilige Anwendung aufgerufen.


Benutzer
""""""""

In der Verwaltungsansicht für Benutzer werden alle Benutzer sowie deren Gruppenzugehörigkeit aufgelistet.


Plugins
"""""""

In der Verwaltungsansicht für Plugins können JavaScript-Plugins für die Verwendung per postMessage im geoEDITOR angelegt und administriert werden.


Auswahllisten
"""""""""""""

In der Verwaltungsansicht für Auswahllisten können Listen zur Auswahl von Sachdaten angelegt werden. Diese können als Sachattribute für den geoEDITOR verwendet werden, um Eingaben für den Anwender zu erleichtern und Schreibfehler zu verhindern.


Seiteninhalte
"""""""""""""

In der Verwaltungsansicht für Seiteninhalte können Inhalte für statische Seiteninhalte des geoEDITOR Kartenclients bearbeitet werden.
Innerhalb der Bearbeitungsmaske können beliebige HTML-Inhalte angelegt werden, um beispielsweise Informationen für die Anwender bereitzustellen.
Interaktive HTML-Elemente (wie bspw. Formulare, Scripts, etc.) werden nicht unterstützt bzw. können nicht gespeichert werden.
Es ist lediglich die Bearbeitung der folgenden drei Seiteninhalte möglich:

1. **about**: Inhalt des Impressums

2. **nutzungsbedingungen**: Inhalt der Seite "Allgemeine Informationen . Nutzungsbedingungen . Haftungsbeschränkung"

3. **info**: Inhalt der Seite "Informationen zur bielefeldKARTE"
