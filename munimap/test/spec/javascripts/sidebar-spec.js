describe('Test sidebar directive', function() {
    var $scope, $rootScope, $compile, sidebarElement;

    beforeEach(module('munimapBase.sidebar'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
    }));

    beforeEach(inject(loadTemplateIntoCache(
        '/__src__/templates/munimap/app/ng-templates/sidebar.html',
        'munimap/sidebar.html'
    )));
    beforeEach(inject(loadTemplateIntoCache(
        '/__src__/templates/munimap/app/ng-templates/sidebar-header.html',
        'munimap/sidebar-header.html'
    )));
    beforeEach(inject(loadTemplateIntoCache(
        '/__src__/templates/munimap/app/ng-templates/sidebar-footer.html',
        'munimap/sidebar-footer.html'
    )));
    beforeEach(inject(loadTemplateIntoCache(
        '/__src__/templates/munimap/app/ng-templates/sidebar-item.html',
        'munimap/sidebar-item.html'
    )));

    beforeEach(function() {
        sidebarElement = createSidebar($compile, $scope);
    });

    it('should have sidebar-items', inject(function($templateCache) {
        var items = sidebarElement.find('.panel');
        expect(items.length).toBe(2);
    }));

    it('should have no open sidebar-item', function() {
        var items = sidebarElement.find('.panel.panel-open');
        expect(items.length).toBe(0);
    });

    it('should open and close item 2', function() {
        sidebarElement.find('.panel[sidebar-item="item2"] .panel-heading').click();
        var items = sidebarElement.find('.panel.panel-open');
        expect(items.length).toBe(1);
        expect($(items[0]).find('.panel-body ng-transclude').text()).toBe('Item 2 content');

        sidebarElement.find('.panel[sidebar-item="item2"] .panel-heading').click();
        items = sidebarElement.find('.panel.panel-open');
        expect(items.length).toBe(0);
    });
});
