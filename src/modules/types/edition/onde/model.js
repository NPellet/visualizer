'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (
  Default,
  Traversing,
) {
  function Model() {}

  $.extend(true, Model.prototype, Default, {
    getjPath() {
      var jpaths = [];
      Traversing.getJPathsFromElement(this.module.view._data, jpaths);
      return jpaths;
    },
  });

  return Model;
});
