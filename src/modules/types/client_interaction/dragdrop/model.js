'use strict';

define(['modules/default/defaultmodel', 'src/util/datatraversing'], function (Default, Traversing) {
  function Model() {
    this.tmpVars = new DataObject();
  }

  var standardFile = new DataObject({
    filename: '',
    mimetype: '',
    contentType: '',
    content: ''
  });

  var standardArray = new DataArray([standardFile]);

  $.extend(true, Model.prototype, Default, {

    init: function () {
      this.tmpVars = new DataObject();
      this.tmpVarsArray = new DataObject();
    },

    getValue: function () {
      return this.dataValue;
    },


    getjPath: function (rel, accepts) {
      var jpaths = [];
      var i;

      if (rel === 'data' || rel === 'dataarray') {
        // Populate tmpVars with empty object so the user can set a variable out even if no file was dropped
        var definedDrops = (this.module.getConfiguration('vars') || []).slice();
        var definedString = this.module.getConfiguration('string');
        var definedPhoto = this.module.getConfiguration('photo');
        if (definedString) {
          for (i = 0; i < definedString.length; i++) {
            definedDrops.push(definedString[i]);
          }
        }

        if (definedPhoto) {
          definedDrops.push(definedPhoto[0]);
        }

        for (i = 0; i < definedDrops.length; i++) {
          var def = definedDrops[i];
          if (!def || !def.variable)
            continue;
          if (rel === 'data' && !this.tmpVars.hasOwnProperty(def.variable)) {
            this.tmpVars[def.variable] = standardFile;
          } else if (rel === 'dataarray' && !this.tmpVarsArray.hasOwnProperty(def.variable)) {
            this.tmpVarsArray[def.variable] = standardArray;
          }
        }
        if (rel === 'data')
          Traversing.getJPathsFromElement(this.tmpVars, jpaths);
        else if (rel === 'dataarray')
          Traversing.getJPathsFromElement(this.tmpVarsArray, jpaths);
      }
      return jpaths;
    }
  });

  return Model;
});
