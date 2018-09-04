'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var data, el;
      switch (rel) {
        case 'element':
          data = this.module.getDataFromRel('dataset');
          if (data) {
            el = data.getChildSync(['data', 0, 'info', 0]);
            if (el) {
              return Traversing.getJPathsFromElement(el);
            }
          }
          break;
        case 'elementList':
          data = this.getAllDataFromRel('dataset');
          if (data) {
            var result = {};
            for (var i in data) {
              result[i] = {};
            }
            return Traversing.getJPathsFromElement(result);
          }
          break;
        case 'cellInfo':
          data = this.module.getDataFromRel('model');
          if (data) {
            return Traversing.getJPathsFromElement({
              x: 0,
              y: 0,
              info: data.data[0][0]
            });
          }
      }
      return [];
    }
  });

  return Model;
});
