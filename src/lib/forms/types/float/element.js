'use strict';

define(['require', '../text/element'], function (require, textElement) {

    var FieldConstructor = function () {
    };

    $.extend(FieldConstructor.prototype, textElement.prototype);


    FieldConstructor.prototype.validate = function (value) {

        var error = false;
        var floatVal = parseFloat(value);

        if (value == '' || floatVal == value) {
            var i = 0, l;

            if (this.field.options.validation && this.field.options.validation.rules) {

                l = this.field.options.validation.rules.length;

                for (; i < l; i++) {

                    var error = false;

                    if (typeof( this.field.options.validation.rules[i].max ) !== 'undefined') {

                        var max = this.field.options.validation.rules[i].max;

                        if (floatVal > max) {
                            error = true;
                        }
                    }

                    if (typeof( this.field.options.validation.rules[i].min ) !== 'undefined') {

                        var max = this.field.options.validation.rules[i].min;
                        if (floatVal < max) {
                            error = true;
                        }
                    }

                    if (error) {
                        this.validation.error = true;
                        this.validation.feedback = this.field.options.validation.rules[i].feedback;
                        return;
                    }

                    this.validation.error = false;
                }
            }

            this.validation.value = floatVal;
            this.validation.error = false;

        } else {

            this.validation.errorType = 1;
        }
    }

    return FieldConstructor;
});