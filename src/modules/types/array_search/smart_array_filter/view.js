'use strict';

define(['jquery', 'modules/default/defaultview'], function ($, Default) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {
        inDom: function () {
            if (!this._div) {
                var that = this;

                var div = this._div = $('<div>').css({
                    width: '100%',
                    fontSize: '20px'
                }).appendTo(this.module.getDomContent());

                var input = this._input = $('<input type="text" />').css({
                    padding: '1px 0px',
                    margin: '0',
                    display: 'inline-block'
                }).appendTo(div);

                input.on('keyup', function () {
                    that.module.controller.onQuery(input.val());
                });

                div.append('&nbsp;<i class="fa fa-search"></i>');
            }

            this.resizeInput();

            this.resolveReady();
        },
        blank: {
            input: function () {
                this._data = null;
            }
        },
        update: {
            input: function (value) {
                this._data = value.resurrect();
                this.module.controller.onQuery('');
            }
        },
        resizeInput: function () {
            var width = this._div.width();
            this._input.css('width', width - 40);
        },
        onResize: function () {
            this.resizeInput();
        }
    });

    return View;

});
