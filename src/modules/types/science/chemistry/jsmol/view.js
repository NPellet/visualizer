'use strict';

define(['require', 'modules/default/defaultview'], function (require, Default) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            var self = this;

            this.dom = $('<iframe>', {src: require.toUrl('./jsmol.html')}).css('border', 0);
            this.module.getDomContent().html(this.dom).css('overflow', 'hidden');

            this.dom.bind('load', function () {
                self.dom.get(0).contentWindow.setInDom(self.module.inDom);
                self.dom.get(0).contentWindow.setController(self.module.controller);
                self.dom.get(0).contentWindow.setView(self);
            });

            this._highlights = this._highlights || [];
        },

        onResize: function () {
            this.dom.height(this.height).width(this.width);

            var jsmolWindow = this.dom.get(0).contentWindow;

            if (jsmolWindow && jsmolWindow.setSize) {
                jsmolWindow.setSize(this.width, this.height);
            }
        },

        update: {
            data: function (data) {
                var self = this;
                self.dom.get(0).contentWindow.setMolFile(data);

                var cfg = $.proxy(self.module.getConfiguration, self.module);
                if (cfg('script')) {
                    self.dom.get(0).contentWindow.executeScript([cfg('script')]);
                }
            }
        },

        onActionReceive: {
            jsmolscript: function (a) {
                this.module.controller.onJSMolScriptReceive(a);
            }
        },

        executeScript: function (src) {
            this.dom.get(0).contentWindow.executeScript([src]);
        }

    });

    return View;

});