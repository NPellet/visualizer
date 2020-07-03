'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }
  
  $.extend(true, Model.prototype, Default, {
    getValue: function () {
      return this.dataValue;
    },
    getjPath: function () {
      const wellsList = this.module.getDataFromRel('wellsList');
      let data = wellsList[0];
      let jpaths = [];
      data = wellsList;
      if (!data || data == null) {
        return jpaths;
      }
      Traversing.getJPathsFromElement(data, jpaths);
      if (jpaths.length !== 0) jpaths = jpaths[0].children[0].children;
      return jpaths;
    }
  });
  return Model;
});
