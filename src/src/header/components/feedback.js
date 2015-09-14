'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', './../../util/couchshare', 'forms/button', 'src/util/util'], function ($, ui, Default, Sharer, Button, Util) {

    function Element() {
    }

    var shareOptions = {
        couchUrl: 'http://visualizer.epfl.ch',
        database: 'x',
        tinyUrl: 'http://visualizer.epfl.ch/tiny'
    };

    Util.inherits(Element, Default, {

        initImpl: function () {
        },

        _onClick: function () {
            ui.feedback(this.options, shareOptions);
        }
    });

    return Element;

});
