'use strict';

define(['jquery', 'modules/default/defaultview', 'lodash'], function ($, Default, _) {

    function View() {
        this._query = null;
        this._data = null;
    }

    $.extend(true, View.prototype, Default, {
        inDom: function () {
            this.module.getDomContent().empty();
            var fontSize = this._fontSize = this.module.getConfiguration('fontSize');
            var that = this;

            var div = this._div = $('<div>').css({
                width: '100%',
                fontSize: fontSize + 'px'
            }).appendTo(this.module.getDomContent());

            var input = this._input = $('<input type="text" />').css({
                padding: '0px 0px',
                margin: '0',
                display: 'inline-block',
                fontSize: fontSize + 'px'
            }).appendTo(div);

            if (!this._query) {
                this._query = this.module.getConfiguration('initialValue');
            }
            input.val(this._query);

            var debounce = this.module.getConfiguration('debounce');

            input.on('keyup', _.debounce(function () {
                var value = input.val();
                if (value === that._query) return;
                that._query = value;
                that.module.controller.onQuery(value);
            }, debounce));

            div.append('&nbsp;<i class="fa fa-search"></i>');

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
                this._data = JSON.stringify(value);
                this.module.controller.onQuery(this._query || '');
            }
        },
        resizeInput: function () {
            var width = this._div.width();
            this._input.css('width', width - this._fontSize * 2);
        },
        onResize: function () {
            this.resizeInput();
        }
    });

    return View;

});
