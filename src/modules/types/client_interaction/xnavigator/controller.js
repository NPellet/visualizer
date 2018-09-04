'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'X Nav',
    description: 'X Nav',
    author: 'Norman Pellet',
    date: '9.12.2014',
    license: 'MIT',
    cssClass: 'xnav'
  };

  Controller.prototype.references = {
    xcoords: {
      label: 'X Coords'
    }
  };

  Controller.prototype.events = {
    onMove: {
      label: 'Move',
      description: '',
      refVariable: ['xcoords'],
      refAction: ['xcoords']
    }
  };

  Controller.prototype.move = function (x) {
    this.createDataFromEvent('onMove', 'xcoords', x);
    this.sendActionFromEvent('onMove', 'xcoords', x);
  };

  Controller.prototype.variablesIn = ['xcoords'];

  Controller.prototype.actionsIn = {
    changeX: 'Change X center value'
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            step: {
              type: 'float',
              title: 'Step',
              default: 1
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    step: ['groups', 'group', 0, 'step', 0]
  };

  return Controller;
});
