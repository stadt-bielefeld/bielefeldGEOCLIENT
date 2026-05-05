angular.module('munimapBase').value('Tour', new Tour({
    storage: window.localStorage,
    steps: [
        {
            element: '.menu-control',
            title: 'Menü',
            content: 'Öffnet das Seitenmenü.'
        },
        {
            element: '.tools-control',
            title: 'Toolbox',
            content: 'Werkzeuge \n Messen, Speichern/Laden, Passwort, Hilfe-Tour'
        }
    ]
}));