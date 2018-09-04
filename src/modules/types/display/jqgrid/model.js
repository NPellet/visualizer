'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {

    getValue: function () {
      return this.dataValue;
    },

    getjPath: function (rel, temporary) {
      var data;

      switch (rel) {
        case 'selectedrows':
        case 'row':
        case 'element': // Wants to get the row ?
          data = (temporary && temporary.list) ? temporary.list : (this.module.getDataFromRel('list') || new DataArray());
          data = data.get(0);

          if (!data)
            return [];
          break;

        default:
          data = this.module.data;
          break;
      }

      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      return jpaths;
    }

  });

  return Model;
});
