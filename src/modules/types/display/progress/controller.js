'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Progress bar',
    description: 'Display a progress bar',
    author: 'Michaël Zasso',
    date: '28.04.2015',
    license: 'MIT',
    cssClass: 'progress'
  };

  Controller.prototype.references = {
    total: {
      label: 'Total progress',
      type: 'number'
    }
  };

  Controller.prototype.variablesIn = ['total'];

  Controller.prototype.actionsIn = {
    inc: 'Increment current progress',
    set: 'Set current progress',
    total: 'Change total progress'
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            tpl: {
              type: 'text',
              title: 'Progress template',
              default: ':current / :total'
            },
            barcolor: {
              type: 'spectrum',
              title: 'Bar color',
              default: [204, 204, 204, 1] // #CCC (default of jquery-ui)
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    tpl: ['groups', 'group', 0, 'tpl', 0],
    barcolor: ['groups', 'group', 0, 'barcolor', 0]
  };

  return Controller;
});
