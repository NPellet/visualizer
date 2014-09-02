'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {

        getjPath: function (rel, accepts) {
            var jpath = [];
            if (rel === 'results')
                Traversing.getJPathsFromElement(this.module.model._data, jpath);
            return jpath;
        }

    });

    return Model;

});