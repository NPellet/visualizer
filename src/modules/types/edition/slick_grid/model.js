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
          if (this.module.controller.lastClickedItem) {
            data = this.module.controller.lastClickedItem;
          } else {
            data = (temporary && temporary.list) ? temporary.list : (this.module.getDataFromRel('list') || new DataArray());
            data = data.get(0);
            if (!data) {
              data = (temporary && temporary.data) ? temporary.data : (this.module.getDataFromRel('data') || new DataArray());
              data = data.get(0);
            }
          }

          break;

        default:
          data = this.module.data;
          break;
      }

      var customJpaths = this.module.definition.configuration.groups;
      if (customJpaths) {
        customJpaths = customJpaths.group[0].customJpaths;
        if (customJpaths && customJpaths[0]) {
          customJpaths = customJpaths[0];
          customJpaths = customJpaths.split(',').map(function (el) {
            return el.split('.');
          });
        }
      }
      customJpaths = customJpaths || [];
      customJpaths = customJpaths.filter((jp) => jp);
      var jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);
      for (let i = 0; i < customJpaths.length; i++) {
        Traversing.addJpathToTree(jpaths, customJpaths[i]);
      }

      return jpaths;
    }
  });


  return Model;
});
