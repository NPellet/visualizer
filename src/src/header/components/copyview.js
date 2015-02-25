'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'src/util/util'], function ($, ui, Default, Versioning, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        _onClick: function () {
            var str = Versioning.getViewJSON('  ');
            var strlen = str.length;
            var txtarea = $('<textarea/>').text(str).css({
                width: '100%',
                height: '95%'
            });
            ui.dialog(txtarea, {
                width: '80%',
                height: $('#ci-visualizer').height() * 0.7
            });

            var txtdom = txtarea.get(0);

            txtdom.selectionStart = 0;
            txtdom.selectionEnd = strlen;
            txtdom.focus();
        }

    });

    return Element;

});
