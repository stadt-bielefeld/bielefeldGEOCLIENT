.. _digitize_config:

Digitalisieren-Konfiguration
############################

Das `Digitalisier`-Modul besteht aus einer Kartenanwendung, sowie einem Administrationsbereich.

Über die Benutzerverwaltung können Benutzer die Berechtigung bekommen, digitize-Layer zu bearbeiten und zu administrieren.

``digitize_admin``
""""""""""""""""""
Benutzer darf digitize-Layer bearbeiten und administrieren.


``digitize_edit``
"""""""""""""""""
Benutzer darf digitize-Layer bearbeiten.




Das `Digitalisier`-Modul führt einen eigenen Layertypen :ref:`digitize <digitize_layer>` ein, der in der :ref:`layers_conf.yaml <layersconf>` angegeben werden kann.


Konfigurieren der Kartenanwendung
---------------------------------

Über die digitize.yaml wird die Digitalisier-Kartenanwendung konfiguriert. Diese wird als normales Projekt im Administrationsbereich der Basis-Anwendung bearbeitet. Ihr Aufbau ist identisch mit der :ref:`default-config.yaml <defaultconf>`, mit der Ausnahme, dass nur die Layerswitcher-Komponente zur Verfügung steht.


.. _digitize_layer:

Digitize-Layer
--------------

Mit dem `Digitalisier`-Modul wurde der Layertyp `digitize` hinzugefügt. Dieser dient der Bereitstellung der im `Digitalisier`-Modul angelegten Layer in den Anwendungen. Der Layertyp unterschiedet sich lediglich in der zu verwendenden `source` von den anderen Layern.

Source Optionen
"""""""""""""""

    name
        Name des Layers
    srs
        Koordinatensystem, in dem der Layer in der Datenbank abgelegt ist.

.. code-block:: yaml

    layers:
      - name: baustellen
        title: Baustellen
        type: digitize
        source:
          name: baustellen_layer
          srs: 'EPSG:25832'
