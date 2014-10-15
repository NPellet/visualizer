'use strict';

define(['modules/default/defaultmodel'], function (Default) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {
        getValue: function () {
            return this.dataValue;
        },
        getjPath: function () {
            return [];
        }
    });

    return Model;

});