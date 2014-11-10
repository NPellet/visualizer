'use strict';

require.config({
    packages:[
        {
            name: "alpaca",
            main: "../components/alpaca/alpaca"
        }
    ]
});

define(['modules/default/defaultview', 'src/util/util', 'jquery', 'forms/button', 'lodash', 'alpaca'], function (Default, Util, $, Button, _, Alpaca) {

    Util.loadCss('components/alpaca/alpaca.css');
    Util.loadCss('components/alpaca/alpaca-jqueryui.css', function() {
        console.log('css loaded');
    });

    function View() {
        this._id = Util.getNextUniqueId();
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            var that = this;
            if(_.isEmpty(JSON.parse(this.module.getConfiguration('schema'))))
                this.module.definition.configuration.groups.group[0].schema = '{\n  "title": "Main Title",\n  "description": "What does this form do?",\n  "type": "object",\n  "properties": {\n    "name": {\n      "type": "string",\n      "title": "Name"\n    },\n    "ranking": {\n      "type": "string",\n      "title": "Ranking",\n      "enum":\n      ["excellent", "not too shabby", "alpaca built my hotrod"]\n    }\n  }\n}'

        },
        inDom: function () {
            this.renderForm();
            this.resolveReady();
        },
        initForm: function () {

        },

        renderForm: function() {
            var that = this;
            var schema = this.module.controller.getSchema();
            this.$alpaca = $('<div>').attr('id', this._id);
            this.module.getDomContent().html(this.$alpaca);
            this.$alpaca.html('');
            this.$alpaca.alpaca({
                schema: schema,
                data: that.inputVal,
                postRender: function(form) {
                    that._form = form;
                }
            });

            if(this.module.getConfigurationCheckbox('hasButton', 'show')) {
                this.module.getDomContent().append(new Button(this.module.getConfiguration('button_text'), function () {
                    if(that._form) {
                        that.module.controller.onSubmit(that._form.getValue());
                    }
                }, {color: 'green'}).render().css({
                        marginTop: "10px"
                    }));
            }

            var debouncing = this.module.getConfiguration('debouncing', -1);
            if (debouncing > -1) {
                var cb = function () {
                    that.module.controller.onSubmit(that._form.getValue());
                };
                if (debouncing > 0) {
                    cb = _.debounce(cb, debouncing);
                }
                this.$alpaca.off('input change', cb);
                this.$alpaca.on('input change', cb);
            }


        },

        updateFormData: function() {
            this.$alpaca.alpaca({
                data: this.inputVal
            })
        },

        update: {
            inputValue: function (value) {
                this.inputObj = value;
                this.inputVal = value.resurrect();
                this.renderForm();
            },
            schema: function (value) {
                this.module.controller.inputSchema = value;
                this.renderForm();
            },
            options: function(value) {

            }
        },
        exportForm: function () {

        }
    });

    return View;

});