'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function model() {
    }
    model.prototype = $.extend(true, {}, Default, {

        getValue: function () {
            return this.dataValue;
        },


        getjPath: function (rel) {
            var data = [];
            var view = this.module.view;
            switch (rel) {

                case 'mzList':
                case 'selectedIngredient':
                    if (view.gcmsInstance.ingredients[0]) data = view.gcmsInstance.ingredients[0][0];

                    break;

                case 'GCIntegration':
                    if (view.annotations) data = view.annotations[0];
                    break;

                default:
                case 'gcdata':
                    if (view.jcamp) data = view.jcamp.gcms.gc;

                    break;
            }

            var jpaths = [];
            Traversing.getJPathsFromElement(data, jpaths);

            return jpaths;
        }


    });

    return model;
});
