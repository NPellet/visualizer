'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {

    getValue: function () {
      return this.dataValue;
    },

    getjPath: function () {
      var data = this.module.getDataFromRel('list');

      if (!data || data == null) {
        return;
      }

      data = data.getData();

      if (data == null) {
        return;
      }

      var jpath = {};
      Traversing._getjPath(data[0], jpath);
      return jpath;
    }
  });

  return Model;
});
