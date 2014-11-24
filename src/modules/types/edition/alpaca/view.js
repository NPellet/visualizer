'use strict';

require.config({
    packages:[
        {
            name: "alpaca",
            main: "../components/alpaca/alpaca"
        }
    ]
});

define(['modules/default/defaultview', 'src/util/util', 'jquery', 'forms/button', 'lodash', 'alpaca'], function (Default, Util, $, Button, _) {

    Util.loadCss('components/alpaca/alpaca.css');
    Util.loadCss('components/alpaca/alpaca-jqueryui.css', function() {
        console.log('css loaded');
    });

    var renderForm = function(that) {
        var schema = that.module.controller.getSchema();
        var options = that.module.controller.getOptions();
        that.$alpaca = $('<div>').attr('id', that._id);
        that.module.getDomContent().html(that.$alpaca);
        that.$alpaca.html('');
        that.$alpaca.alpaca({
            schema: schema,
            data: that.inputVal,
            postRender: function(form) {
                that._form = form;
                if(that.module.getConfigurationCheckbox('sendOnLoad', 'yes')) {
                    that.module.controller.onSubmit(that._form.getValue());
                }
            },
            options: options
        });

        if(that.module.getConfigurationCheckbox('hasButton', 'show')) {
            that.module.getDomContent().append(new Button(that.module.getConfiguration('button_text'), function () {
                if(that._form) {
                    that.module.controller.onSubmit(that._form.getValue());
                }
            }, {color: 'green'}).render().css({
                    marginTop: "10px"
                }));
        }

        var debouncing = that.module.getConfiguration('debouncing', -1);
        if (debouncing > -1) {
            var cb = function () {
                that.module.controller.onSubmit(that._form.getValue());
            };
            if (debouncing > 0) {
                cb = _.debounce(cb, debouncing);
            }
            that.$alpaca.off('input change', cb);
            that.$alpaca.on('input change', cb);
        }
    };

    var renderFormDebounce = _.debounce(renderForm, 100);

    function View() {
        this._id = Util.getNextUniqueId();
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {


        },
        inDom: function () {
            renderForm(this);
            this.resolveReady();
        },
        initForm: function () {

        },

        update: {
            inputValue: function (value) {
                this.inputObj = value;
                this.inputVal = value.resurrect();
                renderFormDebounce(this);
            },
            schema: function (value) {
                this.module.controller.inputSchema = value;
                renderFormDebounce(this);
            },
            options: function(value) {
                this.module.controller.inputOptions = value;
                renderFormDebounce(this);
            }
        },
        exportForm: function () {

        }
    });

    return View;

});