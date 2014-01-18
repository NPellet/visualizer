define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {

    function model() {
    }
    
    model.prototype = $.extend(true, {}, Default, {
        getjPath: function(rel) {
            var jpaths = [];
            if (rel === 'result') {
                Traversing.getJPathsFromElement(this.module.controller.variables, jpaths);
            }
            return jpaths;
        }
    });

    return model;
});