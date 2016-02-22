'use strict';

define(['jquery'], function ($) {

    var FieldElement = function () {
    };

    FieldElement.defaultOptions = {};

    $.extend(FieldElement.prototype, {

        init: function (options) {
            this.options = $.extend(true, {}, FieldElement.options, options);
            this.validation = {error: undefined, value: undefined};
        },

        getDom: function () {
            this._dom || ( this._dom = this._makeDom() );
            this.field.changed(this);
            return this.dom;
        },

        display: function () {
            this.getDom().show();
        },

        hide: function () {
            this.getDom().hide();
        },

        getName: function () {
            return this.field.name;
        },

        getExpander: function (delay) {
            var dom = this.form.getExpanderDom();
            dom.css(this.groupElement.getExpanderInfosFor(this)).css('height', '');
        },

        hideExpander: function () {
            this.form.hideExpander();
        },

        showExpander: function () {

            this.getExpander();
            this.field.showExpander(this);
        },

        redoTabIndices: function () {

            if (this.fieldElement) {
                this.fieldElement.attr('tabindex', 1);
            }
            this.form.incrementTabIndex(this);
        },

        focus: function () {

            if (this.fieldElement) {
                this.fieldElement.trigger('click').trigger('focus');
            }
        },

        setValueSilent: function (value, doNotNotifyForm) {
            var oldValue = this._value;

            this._validate(value);

            if (this.validation.error) {

                //this.showError( );
                return;
            }

            value = this.validation.value;

            this._value = value;
            this.field.changed(this);

            if (!doNotNotifyForm) {
                this.form.fieldElementValueChanged(this, value, oldValue);
            }

            // The conditional displaying will mess with the dom. This can be done only if the dom whole document model is
            // already created. Otherwise nevermind, all fields will be examined when the dom is created.
            // This is due to the fact that setting a value may (and will) occur before creating the dom.
            if (this._inDom) {
                this.form.conditionalDisplayer.changed(this, oldValue);
            }
        },

        showError: function () {

            if (!this.dom) {
                return false;
            }

            this.dom.removeClass('form-field-valid');

            if (!this.validation.feedback) {
                return;
            }

            if (this.validation.feedback._class) {
                this.dom.addClass('form-field-error');
            }

            if (this.validation.feedback.message) {
                this.addValidationMessage(this.validation.feedback.message);
            }

            return true;
        },

        hideError: function () {

            if (!this.dom) {
                return false;
            }

            this.dom.removeClass('form-field-error');
            if (this.field.options.validation && this.field.options.validation.positiveFeedback) {

                this.dom.addClass('form-field-valid');

                if (this.field.options.validation.positiveFeedback.message) {
                    this.addValidationMessage(this.field.options.validation.positiveFeedback.message, true);
                }

            } else {

                this.removeValidationMessage();

            }

            return true;
        },

        addValidationMessage: function (text, valid) {
            if (!this.validationMessageDOM) {
                this.validationMessageDOM = $('<div />');
            }

            if (valid) {
                this.validationMessageDOM.addClass('form-field-valid-message').removeClass('form-field-error-message');
            } else {
                this.validationMessageDOM.addClass('form-field-error-message').removeClass('form-field-valid-message');
            }

            this.dom.after(this.validationMessageDOM.html(text));
        },

        removeValidationMessage: function () {

            if (!this.validationMessageDOM) {
                return;
            }

            this.validationMessageDOM.remove();
        },

        _validate: function (value) {

            this.validation.value = value;
            this.backupValidation();
            this.validation.error = undefined;
            this.validate(value);

            if (!this.validation.error) {
                this.field.validate(this, value);
            }

            this.doValidationFeedback();
        },

        validate: function (value) {

            //this.validation.value = value;
            //	this.validation.error = false;
        },

        backupValidation: function () {
            this._backedUpValidation = this._backedUpValidation || {};
            this._backedUpValidation.error = this.validation.error;
            this._backedUpValidation.value = this.validation.value;
        },

        doValidationFeedback: function () {

            if (( this._backedUpValidation.error === true || ( this._backedUpValidation.error === undefined ) ) && this.validation.error === false) {

                if (this.hideError()) {

                } else {
                    this.validation.error = undefined;
                }
            }

            if (!this._backedUpValidation.error && this.validation.error === true) {

                if (this.showError()) {

                } else {
                    this.validation.error = undefined;
                }
            }
        },

        setDefaultOr: function (el) {

            if (el !== undefined && el !== null) {
                this.value = this.insertValue(el);
            } else {
                var defaultValue = this.field.options.default;
                if (Array.isArray(defaultValue)) {
                    // prevent the same instance to be used in different places
                    defaultValue = defaultValue.slice();
                }
                this.value = this.insertValue(defaultValue);
            }
        },

        inDom: function () {
        },

        unSelect: function (event) {

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.selected = false;
            this.form.unSelectFieldElement(this);

            if (this.field.domExpander) {
                this.hideExpander();
            }


            if (this.fieldElement) {
                this.fieldElement.removeClass('selected');
            }
        },

        select: function (event) {

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            this.selected = true;

            this.form.selectFieldElement(this);

            // Does the dom exist ?
            if (this.field.domExpander) {
                this.showExpander();
            }


            if (this.fieldElement) {
                this.fieldElement.addClass('selected');
            }
        },

        toggleSelect: function (event) {

            if (!this.selected) {
                this.select(event);
            } else {
                this.unSelect(event);
            }
        },

        extractValue: function () {

            if (this.field.options.extractValue) {
                return this.field.options.extractValue(this.value);
            }

            return this.value;
        },


        insertValue: function (value) {

            if (this.field.options.insertValue) {
                return this.field.options.insertValue(value);
            }

            return value;
        }
    });


    Object.defineProperty(FieldElement.prototype, 'form', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._form || this.field.form;
        },

        set: function (form) {
            this._form = form;
        }
    });

    Object.defineProperty(FieldElement.prototype, 'field', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._field;
        },

        set: function (field) {
            this._field = field;
        }
    });

    Object.defineProperty(FieldElement.prototype, 'groupElement', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._groupElement;
        },

        set: function (field) {
            this._groupElement = field;
        }
    });

    Object.defineProperty(FieldElement.prototype, 'value', {
        enumerable: true,
        configurable: false,
        get: function () {
            return this._value;
        },

        set: function (value) {

            this.setValueSilent(value);
            this.checkValue();
        }
    });

    return FieldElement;

});
