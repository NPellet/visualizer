'use strict';

define(['modules/default/defaultview', 'forms/button', 'src/util/ui'], function (Default, Button, ui) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
            var label;
            this.dom = $('<div></div>');
            var buttonType = this.module.getConfiguration('toggle');
            if (buttonType === 'toggle') {
                label = this.module.getConfiguration('offLabel');
            } else {
                label = this.module.getConfiguration('label');
            }
            var self = this,
                button = new Button(label, function (e, val) {
                        var prom = Promise.resolve(true);
                        if (that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
                            prom = ui.confirm(that.module.getConfiguration('confirmText'), that.module.getConfiguration('okLabel'), that.module.getConfiguration('cancelLabel'));
                        }
                        prom.then(function (ok) {
                            if (!ok) {
                                return;
                            }
                            if (!val && buttonType === 'toggle') {
                                button.setTitle(that.module.getConfiguration('offLabel'));
                                that.setButtonColor(that.module.getConfiguration('offColor'));
                            } else if (buttonType === 'toggle') {
                                button.setTitle(that.module.getConfiguration('onLabel'));
                                that.setButtonColor(that.module.getConfiguration('onColor'));
                            }
                            self.module.controller.onClick(val);
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

            if (buttonType === 'toggle') {
                that.setButtonColor(that.module.getConfiguration('offColor'));
            }

            this.resolveReady();
        },

        setButtonColor: function (color) {
            color = 'rgba(' + color.join(',') + ')';
            this.button.setColorCss(color);
        }
    });

    return View;

});
