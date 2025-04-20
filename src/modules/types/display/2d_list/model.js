'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (
  Default,
  Traversing,
) {
  function Model() {}

  $.extend(true, Model.prototype, Default, {
    getValue() {
      return this.dataValue;
    },
    getjPath() {
      var jpaths = [];
      var data = this.module.getDataFromRel('list');
      if (!data || data == null) {
        return jpaths;
      }

      data = data[0];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    },
  });

  return Model;
});
