'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {

    getjPath: function (ref) {
      if (ref === 'nodeData' && this._objectModel) {
        return Traversing.getJPathsFromElement(this.module.model._objectModel);
      } else {
        return [];
      }
    }

  });

  return Model;
});
