'use strict';

define(['require', 'modules/default/defaultview'], function (require, Default) {

    function View() {
    }

    var views = {};

    window.addEventListener('message', function (event) {

        var message = JSON.parse(event.data);
        if (message.module !== 'jsmol') {
            return;
        }
        var id = message.id;
        if (!views[id]) {
            console.error('No view with ID ' + id);
            return;
        }
        var view = views[id];
        switch (message.type) {
            case 'ready':
                view.resolveReady();
                break;
            default:
                console.error('Message type not handled: ', message.type);
                break;
        }
    });

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            var self = this;

            var id = this.module.getId();
            views[id] = this;

            this.dom = $('<iframe>', {src: require.toUrl('./jsmol.html')}).css('border', 0);
            this.module.getDomContent().html(this.dom).css('overflow', 'hidden');

            this._highlights = this._highlights || [];

            this.dom.bind('load', function () {
                self.postMessage('init', {
                    id: id
                });
            });

        },

        onResize: function () {
            this.dom.height(this.height).width(this.width);
            this.postMessage('setSize', {width: this.width, height: this.height});
        },

        update: {
            data: function (data) {
                var self = this;
                self.postMessage('setMolFile', data.get());

                if (self.module.getConfiguration('script')) {
                    self.postMessage('executeScript', [self.module.getConfiguration('script')]);
                }
            }
        },

        onActionReceive: {
            jsmolscript: function (a) {
                this.module.controller.onJSMolScriptReceive(a);
            }
        },

        executeScript: function (src) {
            this.postMessage('executeScript', [src]);
        },

        postMessage: function (type, message) {
            var cw = this.dom.get(0).contentWindow;
            if (cw) {
                cw.postMessage(JSON.stringify({
                    type: type,
                    message: message
                }), '*');
            }
        },

        remove: function (id) {
            delete views[id];
        }

    });

    return View;

});