'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var data;
      switch (rel) {
        case 'point':
          data = this.module.data || new DataArray();
          data = data.get(0);
          if (!data) {
            return [];
          }
          break;
        default:
          data = this.module._data;
          break;
      }
      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }
  });

  return Model;
});
