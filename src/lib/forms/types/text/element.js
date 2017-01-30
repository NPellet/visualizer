'use strict';

define(['jquery-ui/ui/widgets/autocomplete'], function () {

    var FieldConstructor = function () {
    };

    FieldConstructor.prototype.__makeDom = function () {
        var self = this,
            dom = $('<div />'),

            input = $('<input />', {type: 'text'})
                .addClass('field-list')
                .appendTo(dom)
                .bind('click', function (event) {

                    self.toggleSelect(event);

                })
                .bind('keyup blur', function () {
                    var val;
                    if (self.value !== ( val = $(this).val() )) {
                        self.setValueSilent($(this).val());
                    }


                }).bind('keydown', function (e) {

                    if (self.field.form.tabPressed(e, self)) {
                        this.blur();
                    }

                });

        this.checkValue();

        this.dom = dom;
        this.input = input;
        this.fieldElement = input;

        return dom;
    };

    FieldConstructor.prototype.inDom = function () {
        if (this.field.getOptions(this)) {
            this.input.autocomplete({
                minLength: 0,
                source: this.field.getOptions(this)
            });

            this.input.bind('click', () => this.input.autocomplete('search', this.value));

            this.input.autocomplete('widget').addClass('form-autocomplete');
        }
    };

    FieldConstructor.prototype.checkValue = function () {
        if (this.value === null) {
            this.value = '';
        }

        if (this.dom) {
            this.input.val(this.value);
        }
    };

    FieldConstructor.prototype.getOptions = function () {
        return this.autocomplete || false;
    };

    FieldConstructor.prototype.setOptions = function (options) {
        this.autocomplete = options;
    };

    return FieldConstructor;
});
