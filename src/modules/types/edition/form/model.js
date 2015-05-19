'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {

    function Model() {
    }

    $.extend(true, Model.prototype, Default);

    return Model;

});
