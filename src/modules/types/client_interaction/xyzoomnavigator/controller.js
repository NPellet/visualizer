'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'X-Y-Z Zoom',
    description: 'X,Y,Z Zoom handles like Google Maps',
    author: 'Norman Pellet',
    date: '9.12.2014',
    license: 'MIT',
    cssClass: 'xyzzoom'
  };

  Controller.prototype.references = {
    xycoords: {
      label: 'XY Coords'
    },
    zoom: {
      label: 'Zoom'
    }
  };

  Controller.prototype.events = {
    onMove: {
      label: 'Move',
      description: '',
      refVariable: ['xycoords'],
      refAction: ['xycoords']
    },
    onZoomChange: {
      label: 'Changes Zoom',
      description: '',
      refVariable: ['zoom'],
      refAction: ['zoom']
    }
  };

  Controller.prototype.move = function (x, y) {
    this.createDataFromEvent('onMove', 'xycoords', [x, y]);
    this.sendActionFromEvent('onMove', 'xycoords', [x, y]);
  };

  Controller.prototype.zoom = function (zoom) {
    this.createDataFromEvent('onZoomChange', 'zoom', zoom);
    // TODO x and y are not defined
    // this.sendActionFromEvent('onZoomChange', 'zoom', [x, y]);
  };

  Controller.prototype.variablesIn = ['xycoords', 'zoom'];

  Controller.prototype.actionsIn = {
    changeZoom: 'Change zoom value',
    changeXY: 'Change XY center value'
  };

  return Controller;
});
