var loadTemplateIntoCache = function(filePath, cachePath) {
    return function($templateCache) {
        var directiveTemplate = null;
        var req = new XMLHttpRequest();
        req.onload = function() {
            directiveTemplate = this.responseText;
        };
        req.open("get", filePath, false);
        req.send();
        $templateCache.put(cachePath, directiveTemplate);
    };
};
