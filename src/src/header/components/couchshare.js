'use strict';

define(['src/util/ui', 'src/header/components/default', 'src/util/util'], function (ui, Default, Util) {

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
