'use strict';

define(['modules/default/defaultmodel'], function (Default) {
  function Model() {
  }

  Model.prototype = $.extend(true, {}, Default, {
    getjPath: function () {
      return [];
    }
  });

  return Model;
});
