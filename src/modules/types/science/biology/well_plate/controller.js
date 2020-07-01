'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }
  
  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Well plate manager',
    description: 'Builds and display well plates',
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
    samplesList: {
      label: 'The array of samples to display',
      type: 'array'
    },
    cellsList: {
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

  Controller.prototype.variablesIn = ['samplesList', 'cellsList', 'plate'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element'
  };
  Controller.prototype.configurationStructure = function () {
    const removeList = ['pos', 'plate', 'cells', 'color'],
      jpaths = this.module.model.getjPath();
    if (jpaths.length !== 0) {
      jpaths[0].children = jpaths[0].children
        .filter((item) => !removeList.find((x) => x === item.title));
    }
    const currentVariable = this.module.model.listRels[0],
      display = currentVariable === 'plate' ? true : false;
    
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            cellSize: {
              type: 'text',
              default: 35,
              title: 'Size of cells (px)',
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
              ],
              displayed: display
            },
            shape: {
              type: 'combo',
              default: 'aligned',
              title: 'Shape',
              options: [
                { title: 'Aligned', key: 'aligned' },
                { title: 'Pair shifted', key: 'pairShifted' },
                { title: 'Odd shifted', key: 'oddShifted' },
              ]
            }
          }
        },
        colorOptions: {
          options: {
            type: 'list',
            multiple: true,
            title: 'Color bar options'
          },
          fields: {
            colorBySample: {
              type: 'checkbox',
              title: 'Color by sample',
              options: {
                yes: 'Yes'
              },
              default: [],
            },
            colorByJpath: {
              type: 'checkbox',
              title: 'Color by jpath',
              options: { yes: 'Yes' },
              default: [],
              displaySource: { yes: 'x' }
            },
            colorjPath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths,
              displayTarget: ['x']
            },
            colorByJpathValue: {
              type: 'checkbox',
              title: 'Color by jpath value',
              options: { yes: 'Yes' },
              default: [],
              displaySource: { yes: 'y' }
            },
            color: {
              type: 'spectrum',
              default: '',
              title: 'Background color',
              displayTarget: ['y']
            },
            jpathValue: {
              type: 'combo',
              default: '',
              title: 'jPath',
              options: jpaths,
              displayTarget: ['y']
            },
            max: {
              type: 'text',
              default: '',
              title: 'Max value',
              options: jpaths,
              displayTarget: ['y']
            },
            min: {
              type: 'text',
              default: '',
              title: 'Min value',
              displayTarget: ['y']
            },
          }
        },
      }
    };
  };

  Controller.prototype.configAliases = {
    cellBorderStyle: ['groups', 'group', 0, 'cellBorderStyle', 0],
    colorBySample: ['groups', 'colorOptions', 0, 'colorBySample', 0],
    cellSize: ['groups', 'group', 0, 'cellSize', 0],
    colnumber: ['groups', 'group', 0, 'colnumber', 0],
    rownumber: ['groups', 'group', 0, 'rownumber', 0],
    direction: ['groups', 'group', 0, 'direction', 0],
    random: ['groups', 'group', 0, 'random', 0],
    colorjpath: ['groups', 'colorOptions', 0, 'colorjPath', 0],
    shape: ['groups', 'group', 0, 'shape', 0],
    colorByJpathValue: ['groups', 'colorOptions', 0, 'colorByJpathValue', 0],
    colorByJpath: ['groups', 'colorOptions', 0, 'colorByJpath', 0],
    color: ['groups', 'colorOptions', 0, 'color', 0],
    jpathValue: ['groups', 'colorOptions', 0, 'jpathValue', 0],
    max: ['groups', 'colorOptions', 0, 'max', 0],
    min: ['groups', 'colorOptions', 0, 'min', 0],
  };
  return Controller;
});
