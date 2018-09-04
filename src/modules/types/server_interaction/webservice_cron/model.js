'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var jpaths = [];

      if (rel === 'result') {
        Traversing.getJPathsFromElement(this.module.controller.variables, jpaths);
      }
      return jpaths;
    }
  });

  return Model;
});
