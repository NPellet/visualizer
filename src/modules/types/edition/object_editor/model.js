'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {
        getjPath: function (rel) {
            var jpaths = [];
            Traversing.getJPathsFromElement(this._latestData, jpaths);
            return jpaths;
        }
    });

    return Model;

});
