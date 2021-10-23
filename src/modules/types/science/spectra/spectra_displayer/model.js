'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
    this.boundaries = {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    };
    this.trackData = {};
  }

  $.extend(true, Model.prototype, Default, {

    setXBoundaries: function (min, max) {
      min = min || 0;
      max = max || 0;
      this.boundaries.xMin = min;
      this.boundaries.xMax = max;
      this.module.controller.zoomChanged('X', min, max);
    },

    setYBoundaries: function (min, max) {
      min = min || 0;
      max = max || 0;
      this.boundaries.yMin = min;
      this.boundaries.yMax = max;
      this.module.controller.zoomChanged('Y', min, max);
    },

    getBoundaries: function () {
      return {
        xMin: this.boundaries.xMin,
        xMax: this.boundaries.xMax,
        yMin: this.boundaries.yMin,
        yMax: this.boundaries.yMax
      };
    },

    getValue: function () {
      return this.dataValue;
    },

    getjPath: function (rel, accepts) {
      var jpaths = [],
        data;

      switch (rel) {
        case 'markerXY':
          data = [0, 0];
          break;
        case 'markerInfos':
          data = this.module.controller.infos;
          break;
        case 'shapeInfos':
          var annot = this.module.getDataFromRel('annotations');
          if (annot) {
            data = annot[0];
          }
          break;
        case 'trackData':
          data = this.trackData;
          break;
        case 'selectedData':
          data = this.module.controller.selectedData;
          break;
        default:
          data = this.module.data;
          break;
      }

      if (data) {
        Traversing.getJPathsFromElement(data, jpaths);
      }

      return jpaths;
    }

  });

  return Model;
});
