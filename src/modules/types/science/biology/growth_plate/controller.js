'use strict';

define(['modules/default/defaultcontroller', 'src/util/util'], function (Default, Util) {
  var typeList = Util.getStructuresComboOptions();

  function Controller() {
  }
  
  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Plates for growth strains',
    description: 'Build your growth strains data manager',
    author: 'Javier I. Osorio M.',
    date: '23.06.2020',
    license: 'MIT',
    cssClass: 'plate',
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
    },
    plate: {
      label: 'Plate setup information',
      type: 'object'
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
    },
    onSample: {
      label: 'Sample list',
      refVariable: ['list'],
    },
    onList: {
      label: 'Plate list',
      refVariable: ['list'],
    }
  };

  Controller.prototype.variablesIn = ['list', 'plate'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element'
  };
  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            colorBySample: {
              type: 'checkbox',
              title: 'Color by sample',
              options: {
                yes: 'Yes'
              },
              default: []
            },
            colnumber: {
              type: 'text',
              default: 10,
              title: 'Number of columns'
            },
            rownumber: {
              type: 'text',
              default: 10,
              title: 'Number of rows'
            },
            direction: {
              type: 'combo',
              default: 'vertical',
              title: 'Plate direction',
              options: [
                { title: 'Horizontal', key: 'horizontal' },
                { title: 'Vertical', key: 'vertical' },
              ]
            },
            random: {
              type: 'combo',
              default: 'sequential',
              title: 'Filling mode',
              options: [
                { title: 'Sequential', key: 'sequential' },
                { title: 'Random', key: 'random' },
              ]
            },
            shape: {
              type: 'combo',
              default: 'style1',
              title: 'Shape',
              options: [
                { title: 'Style 1', key: 'style1' },
                { title: 'Style 2', key: 'style2' },
                { title: 'Style 3', key: 'style3' },
              ]
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    colorBySample: ['groups', 'group', 0, 'colorBySample', 0],
    colnumber: ['groups', 'group', 0, 'colnumber', 0],
    rownumber: ['groups', 'group', 0, 'rownumber', 0],
    direction: ['groups', 'group', 0, 'direction', 0],
    random: ['groups', 'group', 0, 'random', 0],
    shape: ['groups', 'group', 0, 'shape', 0]
  };
  return Controller;
});
