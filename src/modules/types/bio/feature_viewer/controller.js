'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Protein Feature Viewer',
    description: 'Displays Protein Annotations',
    author: 'Daniel Kostro',
    date: '15.06.2014',
    license: 'MIT',
    cssClass: 'protein_viewer'
  };

  Controller.prototype.references = {
    feature: {
      label: 'An object describing a feature'
    }
  };

  Controller.prototype.events = {
    onFeatureClicked: {
      label: 'A feature was clicked',
      refVariable: ['feature']
    },

    onFeatureMouseOver: {
      label: 'The mouse is over a feature',
      refVariable: ['feature']
    }
  };

  Controller.prototype.onFeatureClicked = function (val) {
    this.createDataFromEvent('onFeatureClicked', 'feature', DataObject.check(val, true));
  };

  Controller.prototype.onFeatureMouseOver = function (val) {
    this.createDataFromEvent('onFeatureMouseOver', 'feature', DataObject.check(val, true));
  };

  Controller.prototype.variablesIn = ['feature'];

  return Controller;
});
