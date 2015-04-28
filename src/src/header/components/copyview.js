'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function ($, ui, Default, Versioning, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        _onClick: function () {
            ui.copyview();
        }
    });

    return Element;

});
