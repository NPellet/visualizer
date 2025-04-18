'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Well plate manager',
    description: 'Builds and display well plates',
    author: 'Javier I. Osorio M.',
    date: '23.06.2020',
    license: 'MIT',
    cssClass: 'plate',
    hidden: true,
  };

  Controller.prototype.references = {
    list: {
      label: 'The array of data to display',
      type: 'array',
    },
    wellsList: {
      label: 'The array of wells to display',
      type: 'array',
    },
    plateSetup: {
      label: 'Setup of the plate',
      type: 'object',
    },
    trackData: {
      label: 'Tracking data',
      type: 'object',
    },
    mouseEvent: {
      label: 'jQuery mouse event',
      type: 'object',
    },
    dataAndEvent: {
      label: 'Mouse event and data',
      type: 'object',
    },
  };

  Controller.prototype.events = {
    onTrackMouse: {
      label: 'Mouse tracking (move)',
      refVariable: ['trackData'],
      refAction: ['trackData', 'mouseEvent', 'dataAndEvent'],
    },
    onTrackClick: {
      label: 'Mouse tracking (click)',
      refVariable: ['trackData'],
      refAction: ['trackData', 'mouseEvent', 'dataAndEvent'],
    },
  };

  Controller.prototype.variablesIn = ['wellsList', 'plateSetup'];

  Controller.prototype.actionsIn = {
    addElement: 'Add an element',
  };

  Controller.prototype.configurationStructure = function () {
    let jpaths = this.module.model.getjPath();

    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            wellSize: {
              type: 'text',
              default: 35,
              title: 'Size of wells (px)',
            },
            colnumber: {
              type: 'text',
              default: 10,
              title: 'Number of columns',
            },
            rownumber: {
              type: 'text',
              default: 10,
              title: 'Number of rows',
            },
            plateIndex: {
              type: 'text',
              default: 0,
              title: 'Index of the first plate',
            },
            direction: {
              type: 'combo',
              default: 'vertical',
              title: 'Plate direction',
              options: [
                { title: 'Horizontal', key: 'horizontal' },
                { title: 'Vertical', key: 'vertical' },
              ],
            },
            shape: {
              type: 'combo',
              default: 'aligned',
              title: 'Shape',
              options: [
                { title: 'Aligned', key: 'aligned' },
                { title: 'Pair shifted', key: 'pairShifted' },
                { title: 'Odd shifted', key: 'oddShifted' },
              ],
            },
          },
        },
        color: {
          options: {
            type: 'list',
            multiple: true,
            title: 'Color bar options',
          },
          fields: {
            colorOptions: {
              type: 'combo',
              title: 'Color options',
              options: [
                { key: 'colorByJpath', title: 'Color by jpath' },
                { key: 'colorByJpathValue', title: 'Color by jpath value' },
              ],
              default: undefined,
              displaySource: {
                colorByJpath: 'x',
                colorByJpathValue: 'y',
              },
            },
            colorjPath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths,
              displayTarget: ['x'],
            },
            spectrumColors: {
              type: 'spectrum',
              default: '',
              title: 'Background color',
              displayTarget: ['y'],
            },
            jpathValue: {
              type: 'combo',
              default: '',
              title: 'jPath',
              options: jpaths,
              displayTarget: ['y'],
            },
            min: {
              type: 'text',
              default: '',
              title: 'Min value',
              displayTarget: ['y'],
            },
            max: {
              type: 'text',
              default: '',
              title: 'Max value',
              options: jpaths,
              displayTarget: ['y'],
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    plateIndex: ['groups', 'group', 0, 'plateIndex', 0],
    colorOptions: ['groups', 'color', 0, 'colorOptions', 0],
    wellSize: ['groups', 'group', 0, 'wellSize', 0],
    colnumber: ['groups', 'group', 0, 'colnumber', 0],
    rownumber: ['groups', 'group', 0, 'rownumber', 0],
    direction: ['groups', 'group', 0, 'direction', 0],
    colorjpath: ['groups', 'color', 0, 'colorjPath', 0],
    shape: ['groups', 'group', 0, 'shape', 0],
    spectrumColors: ['groups', 'color', 0, 'spectrumColors', 0],
    jpathValue: ['groups', 'color', 0, 'jpathValue', 0],
    max: ['groups', 'color', 0, 'max', 0],
    min: ['groups', 'color', 0, 'min', 0],
  };
  return Controller;
});
