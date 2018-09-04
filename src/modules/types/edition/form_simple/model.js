'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, DataTraversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var jpaths = [];

      switch (rel) {
        case 'formValue':
          DataTraversing.getJPathsFromElement(this.module.view.formValue, jpaths);
          break;
      }

      return jpaths;
    }
  });

  return Model;
});
