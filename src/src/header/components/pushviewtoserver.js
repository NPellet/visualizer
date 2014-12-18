'use strict';

define(['jquery', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function ($, Default, Versioning, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        initImpl: function () {
            this.viewHandler = Versioning.getViewHandler();
        },

        _onClick: function () { // Overwrite usual onclick which loads a list / loads views/datas
            var self = this;
            clearTimeout(this.timeout);
            self.$_dom.css({color: '#000'});
            self.viewHandler.serverPush(Versioning.getView()).then(function () {
                self.$_dom.css({color: '#357535'});
                self.returnToBlack();
            }, function () {
                self.$_dom.css({color: '#872A2A'});
                self.returnToBlack();
            });
        },

        returnToBlack: function () {
            var self = this;
            this.timeout = setTimeout(function () {
                self.$_dom.animate({
                    color: '#000'
                }, 500);
            }, 500);
        }

    });

    return Element;
});