'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }


  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var data;
      switch (rel) {
        case 'allpixel':
          data = this.module.controller.lastHoverPixels;
          break;
      }

      if (!data) return [];

      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }
  });

  return Model;
});
