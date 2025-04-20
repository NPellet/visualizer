'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (
  Default,
  Traversing,
) {
  function Model() {}

  $.extend(true, Model.prototype, Default, {
    getjPath() {
      var jpath = [];
      Traversing.getJPathsFromElement(this.module.model.data || {}, jpath);
      return jpath;
    },
  });

  return Model;
});
