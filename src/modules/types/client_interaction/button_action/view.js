'use strict';

define(['modules/default/defaultview', 'forms/button', 'src/util/ui'], function (Default, Button, ui) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            var that = this;
            this.dom = $('<div></div>');

            var self = this,
                button = new Button(this.module.getConfiguration('label'), function (e, val) {
                        var prom = Promise.resolve();
                        if(that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
                            prom = ui.confirm(that.module.getConfiguration('confirmText'));
                        }
                        prom.then(function(ok) {
                            if(ok) {
                                self.module.controller.onClick(val);
                            }
                        });

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