'use strict';

define(['modules/default/defaultview', 'forms/button'], function (Default, Button) {

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
                            prom = confirm(that.module.getConfiguration('confirmText'));
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

    var $dialog;
    function confirm(html) {
        return new Promise(function (resolve) {
            if(!$dialog) {
                $dialog = $('<div/>');
                $('body').append($dialog);
            }
            if(html) {
                $dialog.html(html);
            }

            $dialog.dialog({
                modal: true,
                buttons: {
                    Cancel: function() {
                        resolve(false);
                        $(this).dialog('close');
                    },
                    Ok: function() {
                        resolve(true);
                        $(this).dialog('close');
                    }
                },
                close: function() {
                    resolve(false);
                },
                width: 400
            });
        });

    }

    return View;

});