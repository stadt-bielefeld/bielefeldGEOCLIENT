angular.module('munimapBase.moveableModal', [
    'ui.bootstrap.modal'
])

    .directive('modalDialog', ['$window', function($window){
        return {
            restrict: 'AC',
            link: function(jQueryscope, element) {
                var draggableStr = 'draggableModal';
                var header = jQuery('.modal-draggable', element);
      
                header.on('mousedown', (mouseDownEvent) => {
                    var modalDialog = element;
                    var offset = header.offset();
        
                    modalDialog.addClass(draggableStr).parents().on('mousemove', (mouseMoveEvent) => {
          
                        jQuery('.' + draggableStr, modalDialog.parents()).offset({
                            top: mouseMoveEvent.pageY - (mouseDownEvent.pageY - offset.top),
                            left: mouseMoveEvent.pageX - (mouseDownEvent.pageX - offset.left),
                        });
                        jQuery('.' + draggableStr, modalDialog.parents()).css('bottom', 'auto');
                    }).on('mouseup', () => {
                        modalDialog.removeClass(draggableStr);
                        var modalPosition = modalDialog.position();
                        if (modalPosition.left < 0) {
                            jQuery(modalDialog).offset({
                                left: 0
                            });
                        } 

                        var maxLeft = $window.innerWidth - 200;
                        if (modalPosition.left > maxLeft) {
                            jQuery(modalDialog).offset({
                                left: maxLeft
                            });
                        } 
         
                        if (modalPosition.top < 0) {
                            jQuery(modalDialog).offset({
                                top: 0,
                            });
                        }

                        var maxTop = $window.innerHeight - 200;
                        if (modalPosition.top > maxTop) {
                            jQuery(modalDialog).offset({
                                top: maxTop
                            });
                        } 
                    });
                });    
            }
        };
    }]);