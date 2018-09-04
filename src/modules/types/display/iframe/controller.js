'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Iframe',
    description: 'Shows a integrated iframe with URL as an input',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'iframe'
  };

  Controller.prototype.references = {
    url: {
      type: 'string',
      label: 'URL',
      description: 'Iframe URL'
    }
  };

  Controller.prototype.variablesIn = ['url'];

  return Controller;
});
