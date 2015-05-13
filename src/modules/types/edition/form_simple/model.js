'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, DataTraversing) {

    function Model() {
    }

    Model.prototype = $.extend(true, {}, Default, {

        getjPath: function (rel) {

            var jpaths = [];

            switch (rel) {
                case 'formValue':
                    DataTraversing.getJPathsFromElement(this.module.view.formValue, jpaths);
                    break;
            }

            return jpaths;
        }
    });

    return Model;

});
