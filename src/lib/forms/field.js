'use strict';

define(['require', 'jquery'], function (require, $) {

    var Field = function (name) {
        this.name = name;
    };

    Field.defaultOptions = {};

    $.extend(Field.prototype, {

        init: function (options) {
            this.options = $.extend({}, Field.defaultOptions, options); // Creates the options
            this.elements = [];

            this.initimpl();
        },

        initimpl: function () {

        },

        getTitle: function () {
            return this.options.title || 'Title';
        },

        getType: function () {
            return this.options.type;
        },

        getName: function () {
            return this.name || '';
        },

        isHidden: function () {
            return this.options.hidden;
        },

        isDisplayed: function () {
            return this.options.displayed === true || this.options.displayed === undefined;
        },

        makeElement: function () {

            var
                self = this,
                groupType = this.group.options.type,
                fieldType = this.options.type,
                deferred = $.Deferred();

            require(['./types/' + fieldType + '/' + groupType], function (ElementConstructor) {

                var element = new ElementConstructor();

                element.init(self.options);
                element.field = self;

                self.elements.push(element);


                $.when(element.ready).then(function () {
                    deferred.resolve(element);
                });
            });

            this.group.form.addFieldElement(deferred);

            return deferred;
        },

        removeElement: function (element) {

            this.elements.splice(this.elements.indexOf(element), 1);
        },


        showExpander: function (fieldElement) {

            this._showExpander(fieldElement);
        },

        _showExpander: function (fieldElement) {
            var dom = fieldElement.domExpander || this.domExpander;
            this.fieldElementExpanded = fieldElement;
            this.form.setExpander(dom, fieldElement);
        },

        getElementExpanded: function () {
            return this.fieldElementExpanded;
        },

        changed: function (fieldElement) {
            if (this.options.onChange) {
                this.options.onChange.call(this, fieldElement);
            }
        },

        getOptions: function (fieldElement) {
            return fieldElement.getOptions() || this.options.options;
        },

        validate: function (fieldElement, value) {

            var i = 0, l;

            if (this.options.validation && this.options.validation.rules) {

                l = this.options.validation.rules.length;

                for (; i < l; i++) {

                    if (this.options.validation.rules[i].pattern) {

                        if (( this.options.validation.rules[i].orEmpty && !value ) || new RegExp(this.options.validation.rules[i].pattern).test(value)) {

                            fieldElement.validation.error = false;

                        } else {

                            fieldElement.validation.error = true;
                            fieldElement.validation.feedback = this.options.validation.rules[i].feedback;
                            break;
                        }
                    }

                    if (typeof this.options.validation.rules[i].nonEmpty !== 'undefined') {

                        if (!( this.options.validation.rules[i].nonEmpty && !value )) {

                            fieldElement.validation.error = false;

                        } else {

                            fieldElement.validation.error = true;
                            fieldElement.validation.feedback = this.options.validation.rules[i].feedback;
                            break;
                        }
                    }


                }
            }

            return;
        }
    });


    Object.defineProperty(Field.prototype, 'form', {

        enumerable: true,
        configurable: false,

        get: function () {

            return this._form || this.group.form;
        },

        set: function (form) {
            this._form = form;
        }

    });


    return Field;

});
