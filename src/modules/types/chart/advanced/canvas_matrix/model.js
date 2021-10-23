'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  function getjPath(data) {
    if (data == null)
      return [];

    var jpaths = [];
    Traversing.getJPathsFromElement(data, jpaths);

    return jpaths;
  }

  $.extend(true, Model.prototype, Default, {

    getValue: function () {
      return this.dataValue;
    },

    getjPath: function (rel, accepts) {
      var data = this.module.getDataFromRel('matrix');

      if (!data)
        return;

      data = data.value;
      if (!data)
        return;

      switch (rel) {
        case 'row':
          if (!Array.isArray(data.yLabel)) return;
          data = data.yLabel[0];
          return getjPath(data, accepts);
        case 'col':
          if (!Array.isArray(data.xLabel)) return;
          data = data.xLabel[0];
          return getjPath(data, accepts);
        case 'intersect':
          data = data.data[0][0];
          return getjPath(data, accepts);
        default:
          return false;
      }
    }

  });

  return Model;
});
