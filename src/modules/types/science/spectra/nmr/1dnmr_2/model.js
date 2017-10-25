'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
       
    }

    $.extend(true, Model.prototype, Default, {

        getValue: function () {
            return this.dataValue;
        },

        getjPath: function (rel, accepts) {

            var jpaths = [],
                data;

            data = this.module.data;

            if (data) {
                Traversing.getJPathsFromElement(data, jpaths);
            }

            return jpaths;

        }

    });

    return Model;

});
