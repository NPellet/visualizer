'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', 'src/util/versioning', 'forms/button', 'src/util/util'], function ($, ui, Default, Versioning, Button, Util) {

    function Element() {
    }

    Util.inherits(Element, Default, {

        _onClick: function () {
            var txtarea = $('<textarea></textarea>').css({
                    width: '100%',
                    height: '200px'
                }),
                val, keys,
                btn = new Button('Paste', function () {

                    try {
                        val = JSON.parse(txtarea.val());
                        keys = Object.keys(val);
                        for (var i = 0, ii = keys.length; i < ii; i++) {
                            if (keys[i].charAt(0) === '_')
                                delete val[keys[i]];
                        }
                        Versioning.setDataJSON(val);
                    } catch (_) {
                    }

                    div.dialog('close');
                });

            var div  = ui.dialog(txtarea, {width: '80%'}).append(btn.render());
        }

    });

    return Element;

});
