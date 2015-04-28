'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util'], function ($, ui, Default, Versioning, Button, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        _onClick: function () {
            ui.pasteData();
        }

    });

    return Element;

});
