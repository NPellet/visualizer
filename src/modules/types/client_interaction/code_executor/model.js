'use strict';

define(['modules/types/client_interaction/code_editor/model', 'src/util/datatraversing'], function (CodeEditor, Traversing) {

    function Model() {
    }

    Model.prototype = Object.create(CodeEditor.prototype);

    Model.prototype.getjPath = function (rel) {
        var jpath = [];

        if (rel === 'outputValue' && this.module.controller.lastData) {
            Traversing.getJPathsFromElement(this.module.controller.lastData, jpath);
        }

        return jpath;
    };

    return Model;

});
