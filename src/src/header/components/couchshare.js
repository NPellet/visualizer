'use strict';

define(['jquery', 'src/util/ui', 'src/header/components/default', './couchshare/share', 'forms/button', 'src/util/util'], function ($, ui, Default, Sharer, Button, Util) {

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
            var that = this;
            var uniqid = Util.getNextUniqueId();
            var dialog = $('<div>').html('<h3>Click the share button to make a snapshot of your view and generate a tiny URL</h3><br>').append(
                new Button('Share', function () {
                    var button = this;
                    if (!this.options.disabled) {
                        Sharer.share(that.options).done(function (tinyUrl) {
                            $('#' + uniqid).val(tinyUrl).focus().select();
                            button.disable();
                        }).fail(function () {
                            $('#' + uniqid).val('error');
                        });
                    }
                }, {color: 'blue'}).render()
            ).append(
                $('<input type="text" id="' + uniqid + '" />').css('width', '400px')
            );
            ui.dialog(dialog, this.dialogOptions);
        }

    });

    return Element;

});
