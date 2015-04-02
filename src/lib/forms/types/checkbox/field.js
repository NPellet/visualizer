'use strict';

define(['../../field'], function (FieldDefaultConstructor) {

    var FieldConstructor = function (name) {

        var self = this;
        this.name = name;

    };

    FieldConstructor.prototype = new FieldDefaultConstructor();

    FieldConstructor.prototype.getOptions = function (fieldElement) {

        return fieldElement.getOptions() || this.options.options
    };


    return FieldConstructor;

});