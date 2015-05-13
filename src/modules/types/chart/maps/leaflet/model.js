'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {
        getjPath: function (rel) {
            var data;

            switch (rel) {
                case 'item' :
                    data = this.module.data;
                    break;
                default:
                    return [];
            }

            var jpaths = [];
            Traversing.getJPathsFromElement(data, jpaths);
            return jpaths;
        }
    });

    return Model;

});
