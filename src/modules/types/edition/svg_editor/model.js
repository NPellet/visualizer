'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (
  Default,
  Traversing,
) {
  function Model() {}

  $.extend(true, Model.prototype, Default, {
    getValue() {
      return this.dataValue;
    },
    getjPath(rel) {
      switch (rel) {
        case 'info':
          if (!this.module._data) {
            return [];
          }
          return Traversing.getJPathsFromElement(this.module._data);
        default:
          return [];
      }
    },
  });

  return Model;
});
