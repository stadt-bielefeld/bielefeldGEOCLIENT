describe('Test notification mechanism', function() {
    var $scope, $rootScope, $compile, notificationElement, notificationService;

    beforeEach(module('munimapBase.notification'));
    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
    }));
    beforeEach(function() {
        notificationElement = createNotificationElement($compile, $scope);
    });

    beforeEach(function() {
        inject(function($injector) {
            notificationService = $injector.get('NotificationService');
        });
    });

    var extractNotificationMessageElement = function(element) {
        element = $(element);
        return $(element.children()[0]);
    };

    it('should be empty', function() {
        expect(notificationElement.children().length).toBe(0);
    });
    it('should show info message and close it again', inject(function($timeout) {
        notificationService.addInfo('Info message');
        $scope.$digest();

        var childs = notificationElement.children();
        expect(childs.length).toBe(1);

        var msgElement = extractNotificationMessageElement(childs[0]);
        expect(msgElement.hasClass('alert-info')).toBe(true);
        expect(msgElement.text()).toBe('Info message');

        $timeout.flush();

        expect(notificationElement.children().length).toBe(0);
    }));
    it('should close error message by click', function() {
        notificationService.addError('Error message');
        $scope.$digest();
        var childs = notificationElement.children();
        expect(childs.length).toBe(1);
        var msgElement = extractNotificationMessageElement(childs[0])
        expect(msgElement.hasClass('alert-danger')).toBe(true);
        expect(msgElement.text()).toBe('Error message');
        msgElement.click();
        expect(notificationElement.children().length).toBe(0);
    });
});