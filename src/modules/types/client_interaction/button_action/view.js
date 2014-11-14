'use strict';

define(['modules/default/defaultview', 'forms/button'], function (Default, Button) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            this.dom = $('<div></div>');

            var self = this,
                button = new Button(this.module.getConfiguration('label'), function (e, val) {
                        self.module.controller.onClick(val);
                    },
                    {
                        color: 'Grey',
                        disabled: false,
                        checkbox: this.module.getConfiguration('toggle') !== 'click'
                    }
                );

            this.module.getDomContent().html(this.dom);
            this.dom.html(button.render());
            this.button = button;

            this.resolveReady();
        }
    });

    return View;

});