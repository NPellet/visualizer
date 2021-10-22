'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function () {
      let jpaths = [];
      Traversing.getJPathsFromElement(this._latestData, jpaths);
      return jpaths;
    }
  });

  return Model;
});
