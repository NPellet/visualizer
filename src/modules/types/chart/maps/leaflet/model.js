define(['modules/default/defaultmodel', 'src/util/datatraversing'], function(Default, Traversing) {
    function model() {
    }

    model.prototype = $.extend(true, {}, Default, {
        getjPath: function(rel, accepts) {
            var data;

            switch (rel) {
                case 'item' :
                    data = this.module.data;
                    break;
                default:
                    return [];
                    break;
            }
            
            var jpaths = [];
            Traversing.getJPathsFromElement(data, jpaths);
            return jpaths;
        }
    });
    return model;
});