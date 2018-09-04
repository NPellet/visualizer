'use strict';

define(['modules/types/client_interaction/code_editor/model', 'src/util/util'], function (CodeEditor, Util) {
  function Model() {
    CodeEditor.call(this);
  }

  Util.inherits(Model, CodeEditor);

  return Model;
});
