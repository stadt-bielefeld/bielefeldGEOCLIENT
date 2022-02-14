Tour
####

Für jede Tour ist eine eigene HTML-Datei anzulegen. Die Tour wird innerhalb dieser als Javascript in einem `<script>`-Tag definiert.


Aufbau einer Tour
-----------------

Eine Tour besteht aus dem Tour-Objekt, dem die einzelnen Schritte (`steps`) als Liste übergeben werden. Die Tour wird dann der Anwendung bekannt gemacht.

Der Übersichtlichkeit halber erfolgt die Definition der Schritte in einer eigenen Variable `steps`. Die Liste mit den Schritten kann aber genauso gut direkt in der Tour-Objekt unter `steps` geschrieben werden.

Minimaler Aufbau einer Tour:

.. code-block:: html

    <script type="text/javascript">
        // beinhaltet die einzelnen Tour-Schritte
        var steps = [];
        // initialisiert die Tour
        var tour = new Tour({
            steps: steps
        });
        // macht die Tour der Anwendung bekannt
        angular.module('munimap').value('Tour', tour);
    </script>


Außer dem `steps`-Attribut kann das Tour-Objekt alle auf `http://bootstraptour.com/api/ <http://bootstraptour.com/api/>`_ im Abschnitt `Global options` angegebenen Optionen beinhalten.

Im folgenden wird beschrieben, wie ein eigenes Template für das Tour-Popup angelegt werden kann.


Tour-Template
"""""""""""""

Das Tour-Popup basiert auf `Bootstrap-Popover <https://getbootstrap.com/docs/3.3/javascript/#popovers>`_, wodurch sich folgende grundlegende Struktur für das Template ergibt:

.. code-block:: html

    <div class='popover tour'>
        <!-- Pfeil am Popover, der auf das Element zeigt, dem der angezeigt Schritt zugeordnet ist -->
        <div class='arrow'></div>
        <!-- Container für den Titel des Schritts -->
        <h3 class='popover-title'></h3>
        <!-- Container für den Inhalt des Schritts -->
        <div class='popover-content'></div>
        <!-- Navigation innerhalb der Tour -->
        <div class='popover-navigation'>
            <button class='btn btn-default' data-role='prev'>Zurück</button>
            <button class='btn btn-default' data-role='end'>Tour beenden</button>
            <button class='btn btn-default' data-role='next'>Weiter</button>
        </div>
    </div>

Die Elemente mit den Klassen `popover-title` und `popover-content` werden mit dem im jeweiligen `step` definierten `title`- bzw. `content`-Attribute automatisch befüllt.

Das Template wird dem Tour-Objekt im Attribut `template` zugewiesen. Es kann sowohl als einfacher String als auch als Funktion, die einen String zurückliefert definiert werden.

Einer Funktion werden die Parameter `i`, die den Aktuellen Index des Schrittes beinhaltet und der Parameter `step`, die das aktuelle `step`-Objekt beinhaltet übergeben von der Tour übergeben.

Beispiel für die Verwendung des `template`-Attributes mit einer Funktion um den aktuellen Schritt-Index anzuzeigen:

.. code-block:: javascript

    var Tour = new Tour({
        steps: [],
        // template Funktion
        template: function(i, step) {
            return `<div class='popover tour'>
                        <div class='arrow'></div>
                        <h3 class='popover-title'></h3>
                        <div class='popover-content'></div>
                        <div class='popover-navigation'>
                            <button class='btn btn-default' data-role='prev'>Zurück</button>
                            <span>Schritt ` + i + `</span>
                            <button class='btn btn-default' data-role='next'>Weiter</button>
                        </div>
                    </div>`;
        }
    });


Definition der Schritte
-----------------------

Ein Schritt wird durch ein Javascript Objekt repräsentiert. Mehrere Schritte werden in der `steps` Variable als Liste abgelegt.

Ein `step`-Objekt beinhaltet mindestens die Attribute `element` und `content` wenn der Text an einem Element angezeigt oder `orphan: true` und `content` wenn der Text mittig in der Anwendung platziert werden soll.

`element` legt fest, zu welchem Element der Anwendung der `step` angezeigt werden soll. Das Element wird über einen CSS-Selektor identifiziert, der nur ein Element zurückliefern darf.

`content` legt den anzuzeigenden Inhalt fest. Dieser kann in HTML-Notation definiert werden.


.. code-block:: javascript

    var steps = [
        {
            // der Text des steps wird mittig in der Anwendung ohne Bezug zu einem Element angezeigt
            orphan: true,
            // Text der angezeigt werden soll
            content: 'Willkommen'
        },
        {
            // zeigt den step am Element mit der id foo an
            element: '#foo',
            // Text der angezeigt werden soll
            content: 'Dies ist ein Hilfetext'
        }
    ];

Weiterhin kann ein `step` alle auf `http://bootstraptour.com/api/ <http://bootstraptour.com/api/>`_ im Abschnitt `Step Options` angegebenen Optionen beinhalten. Auf die wichtigsten wird im folgenden näher eingegangen.

``title``
    Legt den Titel eines Schrittes fest.

``onShow``
    Funktion, die ausgeführt wird, bevor der Schritt angezeigt wird. Hier kann beliebiger Javascript-Code ausgeführt werden, z.B. um die Seitenleiste auszuklappen.

``onHide``
    Funktion, die ausgeführt wird, bevor der Schritt ausgeblendet wird. Hier kann beliebiger Javascript-Code ausgeführt werden, z.B. um die Seitenleiste zu schließen.

``placement``
    Definiert die Platzierung des Schritts relativ zum Element, an dem dieser angezeigt werden soll. Mögliche Werte sind `top`, `bottom`, `left`, `right` und `auto`. Der Standartwert ist `right`.