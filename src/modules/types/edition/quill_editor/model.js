'use strict';

define(['jquery', 'modules/default/defaultmodel'], function ($, Default) {
  function Model() { }

  $.extend(true, Model.prototype, Default);

  return Model;
});
