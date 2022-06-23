.. _digitize_admin:


Digitalisieren-Administrationsbereich
#####################################

Benutzer mit administrativem Zugang haben die Möglichkeit weitere Layer und Gruppen anzulegen oder zu löschen. Außerdem können die Eigenschaften und die Standarddarstellung bearbeitet werden.

Auf allen Seiten des Administrationsbereichs befindet sich die `Zurück zur Übersicht`-Schaltfläche mit der Sie zurück zur Startseite des Administrationsbereichs gelangen.


Layer hinzufügen
----------------

Über `Layer hinzufügen` haben Sie die Möglichkeit weitere Layer anzulegen Geben Sie hierzu in der Eingabemaske `Name` und `Titel` des gewünschten Layer an.

Der `Name` muss eindeutig sein, d.h. es darf keinen Layer mit gleichen Namen existieren.


Layer verwalten
---------------

Die einzelnen Layer werden unter dem Punkt `Layer` aufgelistet. Über die Auswahl des Layer-Titels werden die Verwaltungsmöglichkeiten zu dem jeweiligen Layer angezeigt.

Diese sind in `Aktionen`_ und `Gruppen`_ unterteilt.

``Aktionen``
""""""""""""

Im Folgenden werden die Verwaltungsaktionen für einen Layer vorgestellt.

    In Karte Bearbeiten
        Öffnet die `Kartenanwendung` zum Bearbeiten des Layers.

    Eigenschaften Bearbeiten
       Eigenschaften zum Layer zuordnen und deren Titel bearbeiten.

    Darstellung bearbeiten
        Die Standarddarstellung der Geometrien kann pro Layer festlegen werden.

    Layer bearbeiten
        Hier können Name und Titel des Layers bearbeitet werden.

    Löschen
        Hierdurch kann der Layer gelöscht werden. Bitte beachten Sie, dass das Löschen nicht rückgängig gemacht werden kann.


``Gruppen``
"""""""""""

Ein Layer besteht aus mehreren Gruppen. Diese können einzeln aktiviert bzw. deaktiviert werden.

Aktive Gruppen werden in den öffentlich zugänglichen Karten, in denen der Layer eingebunden ist, angezeigt. Im Folgenden werden die Verwaltungsaktionen für eine Gruppe vorgestellt.

Gruppe hinzufügen / bearbeiten

Neben dem Titel kann in der Gruppe eingestellt werden, in welchen Darstellungsbereichen diese angezeigt werden soll. . Auf diese Felder wird weiter unten unter dem Punkt `Sichtbarkeit`_ gesondert eingegangen.

    Gruppe aktivieren / deaktivieren
       Aktive Gruppen werden dem Besucher in der in der Kartenanwendung angezeigt. Schalten Sie daher nur Gruppen aktiv die hierfür vorgesehen sind.

    Gruppe löschen
        Das Löschen einer Gruppe kann nicht rückgängig gemacht werden.


Sichtbarkeit
------------

Über die Felder `Darstellung ab` bzw. `Darstellung bis` einer Gruppe kann die Sichtbarkeit dieser auf bestimmte Detailstufen beschränkt werden.

Dies kann die Übersichtlichkeit in der Karte erhöhen, wenn beispielsweise eine Gruppe mit Geometrien eine Darstellung bis Detailstufe 11 und eine weitere, mit feingliedrigen Geometrien, eine Darstellung ab Detailstufe 12 zugewiesen wird.

Auf das Bearbeiten der Gruppen in der `Kartenanwendung` haben diese Einstellungen keinen Einfluss, d.h. wenn einer Gruppe eine Darstellung ab Detailstufe 12 zugewiesen ist, können in ihr auch in Detailstufe 10 Geometrien hinzugefügt werden. Diese werden aber in der öffentlich zugänglichen Karte erst ab Detailstufe 12 angezeigt.
