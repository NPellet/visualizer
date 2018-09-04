'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'IV stability',
    description: 'Dedicated module to show IV Stability files',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT'
  };

  Controller.prototype.references = {
    url: {
      type: ['string'],
      label: 'URL',
      description: 'Iframe URL'
    }
  };

  Controller.prototype.variablesIn = ['url'];

  Controller.prototype.actionsIn = {
    addSerie: 'Add a new serie',
    removeSerie: 'Remove a serie'
  };

  return Controller;
});
