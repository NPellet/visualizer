'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      var jpath = [];
      if (rel === 'element') {
        var data = this.module.getDataFromRel('loading');
        if (data) {
          data = data.get();
          if (data.series && data.series[0]) {
            var serie = data.series[0];
            if (serie.data && serie.data[0]) {
              Traversing.getJPathsFromElement(serie.data[0], jpath);
            }
          }
        }
      }
      return jpath;
    }
  });

  return Model;
});
