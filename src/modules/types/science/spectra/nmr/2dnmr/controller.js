'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: '2D NMR',
    description: 'Display 2D NMRs using the plot library',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: '2dnmr'
  };

  Controller.prototype.references = {
    jcampx: {
      type: ['jcamp', 'string'],
      label: 'Jcamp on top axis'
    },
    jcampy: {
      type: ['jcamp', 'string'],
      label: 'Jcamp on left axis'
    },
    jcampxy: {
      type: ['jcamp', 'string'],
      label: 'Jcamp on left and top axis'
    },
    jcamp2d: {
      type: ['jcamp', 'string'],
      label: '2D Jcamp'
    },
    annotations: {
      type: 'array',
      label: 'Annotation file'
    }
  };

  Controller.prototype.variablesIn = ['jcampx', 'jcampy', 'jcampxy', 'jcamp2d', 'annotations'];

  return Controller;
});
