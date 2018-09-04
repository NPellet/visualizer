'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Pie chart jit',
    description: 'Display a pie chart based on jit',
    author: 'Michaël Zasso',
    date: '16.01.2014',
    license: 'MIT',
    cssClass: 'pie_chart_jit'
  };

  Controller.prototype.references = {
    chart: {
      type: ['chart', 'object'],
      label: 'A json describing a chart'
    },
    yArray: {
      type: 'array',
      label: '1D Y array'
    }
  };

  Controller.prototype.variablesIn = ['chart', 'yArray'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            sliceOffset: {
              type: 'text',
              title: 'Slice offset',
              default: 1
            },
            updateHeights: {
              type: 'checkbox',
              title: 'Slice height proportional to value ?',
              options: {
                updateHeights: 'Yes (Only for mono-serie pies)'
              }
            }
          }
        }
      }
    };
  };

  Controller.prototype.configFunctions = {
    updateHeights: boolCheckbox,
    showLabels: boolCheckbox
  };

  Controller.prototype.configAliases = {
    sliceOffset: ['groups', 'group', 0, 'sliceOffset', 0],
    updateHeights: ['groups', 'group', 0, 'updateHeights', 0],
    showLabels: ['groups', 'group', 0, 'showLabels', 0],
    labelColor: ['groups', 'group', 0, 'labelColor', 0]
  };

  function boolCheckbox(cfg) {
    return (cfg.length !== 0);
  }

  return Controller;
});
