'use strict';

define(['jquery', 'modules/default/defaultview', 'forms/button', 'src/util/ui', 'src/util/typerenderer'], function ($, Default, Button, ui, Renderer) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        onResize: function () {
            var that = this;
            var label;
            this.dom = $('<div></div>').css({
                width: '100%',
                height: '100%'
            });
            var content = this.module.getConfiguration('content');
            var contentType = this.module.getConfiguration('contentType');
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
                    if (!val && buttonType === 'toggle' && !content) {
                        button.setTitle(that.module.getConfiguration('offLabel'));
                        that.setButtonColor(that.module.getConfiguration('offColor'));
                    } else if (buttonType === 'toggle' && !content) {
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
            if (!content) {
                this.dom.html(button.render());
            } else if (contentType === 'imageUrl') {
                var $img = $('<img src="' + content + '"/>');
                $img.css({
                    width: this.width,
                    height: this.height,
                    cursor: 'pointer',
                    objectFit: 'contain'
                });
                this.dom.html($img);
                this.dom.css({
                    overflow: 'hidden'
                });

                this.dom.on('click', onClick);
            } else if (contentType === 'svg') {
                var $div = $('<div>');
                $div.append(content);
                $div.css('cursor', 'pointer');
                Renderer.render($div, {
                    type: 'svg',
                    value: content
                });
                $div.on('click', onClick);
                this.dom.html($div);
            } else {
                var $div = $('<div>');
                $div.append(content);
                $div.css('cursor', 'pointer');
                $div.on('click', onClick);
                this.dom.html($div);
            }
            this.button = button;

            if (buttonType === 'toggle' && !content) {
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
