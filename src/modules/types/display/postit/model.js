'use strict';

define(['modules/default/defaultmodel'], function (Default) {
  function Model() {
  }

  $.extend(true, Model.prototype, Default, {
    getValue: function () {
      return this.dataValue;
    }
  });

  return Model;
});
