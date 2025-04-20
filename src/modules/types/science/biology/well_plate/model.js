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
      const wellsList = this.module.getDataFromRel('wellsList');
      let jpaths = [];
      if (!wellsList || wellsList == null) {
        return jpaths;
      }
      Traversing.getJPathsFromElement(wellsList[0], jpaths);
      return jpaths;
    },
  });
  return Model;
});
