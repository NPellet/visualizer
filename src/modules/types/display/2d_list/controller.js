'use strict';

define(['modules/default/defaultcontroller', 'src/util/util'], function (Default, Util) {
  var typeList = Util.getStructuresComboOptions();

  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Two dimensional list (old)',
    description: 'Display an array of data in 2 dimensions using a table',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: '2d_list',
    hidden: true
  };

  Controller.prototype.references = {
    cell: {
      label: 'Data of the cell',
      type: 'object'
    },
    list: {
      label: 'The array of data to display',
      type: 'array'
    }
  };

  Controller.prototype.events = {
    onHover: {
      label: 'Hover a cell',
      refVariable: ['cell']
    },
    onClick: {
      label: 'Click a cell',
      refVariable: ['cell'],
      refAction: ['cell']
    }
  };

  Controller.prototype.variablesIn = ['list'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element'
  };

  Controller.prototype.configurationStructure = function () {
    var jpaths = this.module.model.getjPath();

    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            colnumber: {
              type: 'text',
              default: 5,
              title: 'Number of columns'
            },
            valjPath: {
              type: 'combo',
              title: 'Value jPath',
              options: jpaths
            },
            colorjPath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths
            },
            height: {
              type: 'text',
              title: 'Cell height'
            },
            forceType: {
              type: 'combo',
              title: 'Force type',
              default: '',
              options: typeList
            },
            rendererOptions: {
              type: 'text',
              default: '',
              title: 'Renderer options'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    colnumber: ['groups', 'group', 0, 'colnumber', 0],
    colorjpath: ['groups', 'group', 0, 'colorjPath', 0],
    valjpath: ['groups', 'group', 0, 'valjPath', 0],
    height: ['groups', 'group', 0, 'height', 0],
    forceType: ['groups', 'group', 0, 'forceType', 0],
    rendererOptions: ['groups', 'group', 0, 'rendererOptions', 0]
  };

  return Controller;
});
