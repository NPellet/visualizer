'use strict';

define(['modules/default/defaultview', 'forms/button', 'src/util/ui'], function (Default, Button, ui) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        init: function () {
            var that = this;
            var label;
            this.dom = $('<div></div>');
            var imageUrl = this.module.getConfiguration('imageUrl');
            var buttonType = this.module.getConfiguration('toggle');
            if (buttonType === 'toggle' && this.module.getConfiguration('startState') === 'off') {
                label = this.module.getConfiguration('offLabel');
            } else if (buttonType === 'toggle' && this.module.getConfiguration('startState') === 'on') {
                label = this.module.getConfiguration('onLabel');
            } else {
                label = this.module.getConfiguration('label');
            }

            function onClick(e, val) {
                var prom = Promise.resolve(true);
                if (that.module.getConfigurationCheckbox('askConfirm', 'yes')) {
                    prom = ui.confirm(that.module.getConfiguration('confirmText'), that.module.getConfiguration('okLabel'), that.module.getConfiguration('cancelLabel'));
                }
                prom.then(function (ok) {
                    if (!ok) {
                        return;
                    }
                    if (!val && buttonType === 'toggle' && !imageUrl) {
                        button.setTitle(that.module.getConfiguration('offLabel'));
                        that.setButtonColor(that.module.getConfiguration('offColor'));
                    } else if (buttonType === 'toggle' && !imageUrl) {
                        button.setTitle(that.module.getConfiguration('onLabel'));
                        that.setButtonColor(that.module.getConfiguration('onColor'));
                    }
                    that.module.controller.onClick(val);
                });
            }
            var button = new Button(
                label,
                onClick,
                {
                    color: 'Grey',
                    disabled: false,
                    checkbox: this.module.getConfiguration('toggle') !== 'click',
                    value: this.module.getConfiguration('startState') === 'on'
                }
            );

            this.module.getDomContent().html(this.dom);
            if (!imageUrl) {
                this.dom.html(button.render());
            } else {
                this.dom.html('<img src="' + imageUrl + '" width="100%" height="100%" style="cursor: pointer;"/>');
                this.dom.on('click', onClick);

            }
            this.button = button;

            if (buttonType === 'toggle' && !imageUrl) {
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
