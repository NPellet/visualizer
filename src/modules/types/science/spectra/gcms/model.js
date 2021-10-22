'use strict';

define([
  'jquery',
  'modules/default/defaultmodel',
  'src/util/datatraversing'
], function ($, Default, Traversing) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getjPath: function (rel) {
      let data = [];
      let view = this.module.view;
      switch (rel) {
        case 'GCIntegration':
          if (view.annotations) data = view.annotations[0];
          break;

        default:
        case 'gcdata':
          if (view.jcamp) data = view.jcamp.gcms.gc;

          break;
      }

      let jpaths = [];
      Traversing.getJPathsFromElement(data, jpaths);

      return jpaths;
    }
  });

  return Model;
});
