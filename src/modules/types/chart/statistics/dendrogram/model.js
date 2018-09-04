'use strict';

define([
  'jquery',
  'modules/default/defaultmodel',
  'src/util/datatraversing'
], function ($, Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getValue: function () {
      return this.dataValue;
    },
    getjPath: function (rel) {
      var value = this.module.view._value || {};
      while (value.children && value.children.length > 0) {
        value = value.children[0];
      }
      var jpaths = [];
      Traversing.getJPathsFromElement(value, jpaths);
      switch (rel) {
        case 'node':
          return jpaths;
        default:
          return false;
      }
    }
  });

  return Model;
});
