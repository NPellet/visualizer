'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }
  
  $.extend(true, Model.prototype, Default, {
    getValue: function () {
      return this.dataValue;
    },
    getjPath: function () {
      const plate = this.module.getDataFromRel('plate');
      const cellsList = this.module.getDataFromRel('cellsList');
      const samplesList = this.module.getDataFromRel('samplesList');
      let data = cellsList ? cellsList : samplesList ? samplesList : plate.parameters;
      let jpaths = [];
      data = !Array.isArray(data) ? data : data[0];
      if (!data || data == null) {
        return jpaths;
      }
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }
  });
  return Model;
});
