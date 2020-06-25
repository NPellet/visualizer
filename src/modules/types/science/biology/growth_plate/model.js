'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }
  
  $.extend(true, Model.prototype, Default, {
    getValue: function () {
      return this.dataValue;
    },
    getjPath: function () {
      var jpaths = [];
      var data = this.module.getDataFromRel('plate');
      if (!data || data == null) {
        return jpaths;
      }

      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }
  });
  return Model;
});
