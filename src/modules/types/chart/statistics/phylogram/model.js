'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      if (rel === 'leaf') {
        var jpaths = [];
        Traversing.getJPathsFromElement(this.module.controller._data, jpaths);
        return jpaths;
      } else {
        return [];
      }
    }
  });

  return Model;
});
