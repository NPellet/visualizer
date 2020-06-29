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
    sampleList: {
      label: 'The array of samples to display',
      type: 'array'
    },
    cellList: {
      label: 'The array of cells to display',
      type: 'array'
    },
    plate: {
      label: 'Plate setup information',
      type: 'object'
    },
    trackData: {
      label: 'Tracking data',
      type: 'object'
    }
  };

  Controller.prototype.events = {
    onSample: {
      label: 'Sample list',
      refVariable: ['list'],
    },
    onList: {
      label: 'Plate list',
      refVariable: ['list'],
    },
    onTrackMouse: {
      label: 'Mouse tracking (move)',
      refVariable: ['trackData'],
      refAction: ['trackData']
    },
    onTrackClick: {
      label: 'Mouse tracking (click)',
      refVariable: ['trackData'],
      refAction: ['trackData']
    },
  };

  Controller.prototype.variablesIn = ['sampleList', 'cellList', 'plate'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element'
  };
  Controller.prototype.configurationStructure = function () {
    let removeList = ['pos', 'plate', 'cells', 'color'];
    var jpaths = this.module.model.getjPath();
    if (jpaths.length !== 0) {
      jpaths[0].children = jpaths[0].children
        .filter((item) => !removeList.find((x) => x === item.title));
    }

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
            cellSize: {
              type: 'text',
              default: 35,
              title: 'Size of cells (px)'
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
            cellBorderStyle: {
              type: 'combo',
              default: 'solid',
              title: 'Border style',
              options: [
                { title: 'None', key: 'solid' },
                { title: 'Dotted', key: 'dotted' },
                { title: 'Dashed', key: 'dashed' }
              ]
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
            colorjPath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths
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
    cellBorderStyle: ['groups', 'group', 0, 'cellBorderStyle', 0],
    colorBySample: ['groups', 'group', 0, 'colorBySample', 0],
    cellSize: ['groups', 'group', 0, 'cellSize', 0],
    colnumber: ['groups', 'group', 0, 'colnumber', 0],
    rownumber: ['groups', 'group', 0, 'rownumber', 0],
    direction: ['groups', 'group', 0, 'direction', 0],
    random: ['groups', 'group', 0, 'random', 0],
    colorjpath: ['groups', 'group', 0, 'colorjPath', 0],
    shape: ['groups', 'group', 0, 'shape', 0],
  };
  return Controller;
});
