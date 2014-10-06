define(['modules/default/defaultview'], function (Default) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {

            var self = this;
            var $fileInput = $('<input/>').css('display', 'none').attr({
                type: 'file'
            });
            var textarea = $("<textarea>").css({
                position: "absolute",
                top: 0,
                left: 0,
                height: 0,
                width: 0,
                opacity: 0
            }).on("paste", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.module.controller.open(e.originalEvent.clipboardData);
            });
            var defaultMessage = this.module.getConfiguration('label');
            this.messages = {
                'default': defaultMessage,
                drag: this.module.getConfiguration('dragoverlabel') || defaultMessage,
                hover: this.module.getConfiguration('hoverlabel') || defaultMessage
            };
            this.messageP = $('<p>').html(this.messages.default);
            this.dom = $('<div />', { class: 'dragdropzone' }).html(this.messageP).on("click mousemove", function () {
                textarea.focus();
            }).mouseout(function () {
                textarea.blur();
            }).append(textarea);

            //this.dom.append($fileInput);

            this.dom.on('click', function(event) {
                $fileInput.click();
            });

            $fileInput.on('change', function(e) {
                self.module.controller.open(self.module.controller.emulDataTransfer(e));
            });

            $fileInput.on('load', function(e) {
                debugger;
            });

            this.module.getDomContent().html(this.dom);
        },

        inDom: function () {

            var self = this,
                dom = this.dom.get(0);

            dom.addEventListener('mouseenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.hover);
                self.dom.addClass('dragdrop-over');
            });

            dom.addEventListener('dragenter', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.drag);
                self.dom.addClass('dragdrop-over');
            });

            dom.addEventListener('dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });

            dom.addEventListener('dragleave', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.default);
                self.dom.removeClass('dragdrop-over');
            });

            dom.addEventListener('mouseleave', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.messageP.html(self.messages.default);
                self.dom.removeClass('dragdrop-over');
            });

            dom.addEventListener('drop', function (e) {
                e.stopPropagation();
                e.preventDefault();
                console.log(e.dataTransfer);
                self.module.controller.open(e.dataTransfer);
            });

            this.resolveReady();
        }
    });

    return View;
});