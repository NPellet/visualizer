'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var jpath = [];
      if (rel === 'results')
        Traversing.getJPathsFromElement(this.module.model._data, jpath);
      return jpath;
    }
  });

  return Model;
});
