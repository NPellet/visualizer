'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var data;

      switch (rel) {
        case 'item':
          data = this.module.data;
          break;
        default:
          return [];
      }

      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }
  });

  return Model;
});
