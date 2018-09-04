'use strict';

define(['modules/types/client_interaction/code_editor/model', 'src/util/datatraversing', 'src/util/util'], function (CodeEditor, Traversing, Util) {
  function Model() {
    CodeEditor.call(this);
  }

  Util.inherits(Model, CodeEditor, {
    getjPath: function (rel) {
      var jpath = [];

      if (rel === 'outputValue' && this.module.controller.outputObject) {
        Traversing.getJPathsFromElement(this.module.controller.outputObject, jpath);
      }

      return jpath;
    }
  });

  return Model;
});
