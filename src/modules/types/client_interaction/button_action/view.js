'use strict';

define(['modules/default/defaultview', 'forms/button', 'src/util/ui'], function (Default, Button, ui) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            var that = this;
            var label;
            this.dom = $('<div></div>');
            var buttonType = this.module.getConfiguration('toggle');
            if(buttonType === 'toggle') {
                label = this.module.getConfiguration('onLabel');
            }
            else {
                label = this.module.getConfiguration('label');
            }
            var self = this,
                button = new Button(label, function (e, val) {
                        var prom = Promise.resolve(true);
                        if(that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
                            prom = ui.confirm(that.module.getConfiguration('confirmText'));
                        }
                        prom.then(function(ok) {
                            if(ok) {
                                button.setTitle(that.module.getConfiguration('onLabel'));
                                self.module.controller.onClick(val);
                            }
                            if(val) {
                                button.setTitle(that.module.getConfiguration('offLabel'));
                                console.log(that.module.getConfiguration('offLabel'));
                            }
                            else {
                                button.setTitle(that.module.getConfiguration('onLabel'));
                                console.log(that.module.getConfiguration('onLabel'));
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