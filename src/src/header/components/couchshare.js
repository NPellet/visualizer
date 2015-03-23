'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/couchshare', 'forms/button', 'src/util/util'], function ($, ui, Default, Sharer, Button, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        initImpl: function () {
            this.dialogOptions = {
                title: 'Share view',
                width: 550,
                height: 170
            };
        },

        _onClick: function () {
            ui.couchShare(this.options, this.dialogOptions);
        }

    });

    return Element;

});
