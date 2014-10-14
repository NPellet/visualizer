'use strict';

define(['modules/types/client_interaction/code_editor/model'], function (CodeEditor) {

    function Model() {
    }

    Model.prototype = Object.create(CodeEditor.prototype);

    return Model;

});