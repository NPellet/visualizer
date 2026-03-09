'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Placeholder',
    description: 'Placeholder module shown when a module could not be loaded',
    author: 'Michael Zasso',
    date: '09.03.2026',
    license: 'MIT',
    cssClass: 'placeholder',
    hidden: true,
  };

  return Controller;
});
