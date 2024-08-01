.. _selectionlistconf:

Auswahllisten-Definition
########################

Auswahllisten können in unterschiedlichen Konfigurationen definiert werden.
Eine Auswahlliste kann in beliebig vielen Anwendungen referenziert und somit wiederverwendet werden.

Der Name der Auswahlliste wird durch den Dateinamen der Konfigurationsdatei definiert.
Für eine Konfigurationsdatei `meineAuswahlliste.yaml` entspräche der Name der Auswahlliste `meineAuswahlliste`.

Eine Auswahllistenkonfiguration besteht aus einer Liste von Auswahlmöglichkeiten, wobei eine
Auswahlmöglichkeit folgende Attribute aufweist:

  ``value``
    Der Wert der Auswahlmöglichkeit.

  ``label``
    Der Darstellungstext der Auswahlmöglichkeit. Standardwert: Der unter ``value`` angegebene Wert.

Beispiel::

  - value: 'option1'
    label: 'Die erste Option'
  - value: 'option2'
    label: 'Die zweite Option'

Die Konfiguration einer App, welche die oben definierte Auswahlliste referenziert, könnte bspw. so aussehen::

  app:
    title: 'Beispiel Anwendung'

  components:
    geoeditor:
      formFields:
        point:
          - type: 'select'
            name: 'mein_auswahlfeld'
            label: 'Mein Auswahlfeld'
            select: 'meineAuswahlliste'
