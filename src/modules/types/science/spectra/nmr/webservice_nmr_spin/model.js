'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {

        getjPath: function (rel, accepts) {
            var jpath = [];
            Traversing.getJPathsFromElement(this.module.model.data || {}, jpath);
            return jpath;
        }

    });

    return Model;

});
