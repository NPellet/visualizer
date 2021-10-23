'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api', 'src/util/util'], function (Default, Traversing, API, Util) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: '3D scatter plot',
    description: 'Display 3D points',
    author: 'Daniel Kostro',
    date: '01.04.2014',
    license: 'MIT',
    cssClass: 'scatter_3D'
  };

  Controller.prototype.events = {
    onHover: {
      label: 'Hover a 3D point',
      refVariable: ['info', 'coordinates', 'point']
    },
    onClick: {
      label: 'Click a 3D point',
      refVariable: ['info', 'coordinates', 'point']
    }
  };

  Controller.prototype.onHover = function (row) {
    var coord = [
      this.module.view._data.x[row],
      this.module.view._data.y[row],
      this.module.view._data.z[row]
    ];

    this.setVarFromEvent('onHover', 'point', 'data3D', [row]);
    var info = this.module.view._data.getChildSync(['info', row]);
    this.createDataFromEvent('onHover', 'info', info);
    this.createDataFromEvent('onHover', 'coordinates', DataObject.check(coord));
  };

  Controller.prototype.references = {
    chart: {
      type: ['chart', 'object'],
      label: 'A json describing a chart'
    },
    boolArray: {
      type: 'array',
      label: 'An array of boolean'
    },
    data3D: {
      type: 'array',
      label: 'Array of {x, y, z, size, color} objects'
    },
    point: {
      label: 'Point label'
    },
    info: {
      label: 'Point info'
    },
    coordinates: {
      type: 'array',
      label: 'Point coordinates'
    }
  };

  Controller.prototype.elementHover = function (element) {
    if (!element) {
      return;
    }

    if (this._highlighted) {
      API.highlight(this._highlighted, 0);
    }
    API.highlight(element, 1);
    this._highlighted = element;
  };

  Controller.prototype.elementOut = function () {
    if (this._highlighted) {
      API.highlight(this._highlighted, 0);
    }
  };

  Controller.prototype.variablesIn = ['chart', 'boolArray', 'data3D'];

  Controller.prototype.configurationStructure = function () {
    var jpath = [];
    Traversing.getJPathsFromElement(this.module.data, jpath);

    var jpathPoint = this.module.model.getjPath('point', false);
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },

          fields: {

            tooltip: {
              type: 'checkbox',
              title: 'Show tooltip',
              options: { show: 'Yes' }
            },

            tooltipJpath: {
              type: 'combo',
              title: 'Tooltip jPath',
              options: jpath
            },

            displayPointCoordinates: {
              type: 'checkbox',
              title: 'Display point coordinates',
              options: {
                onhover: 'Yes (on hover)'
              }
            },

            grid: {
              type: 'checkbox',
              title: 'Grids',
              options: {
                xy: 'XY Main',
                yz: 'YZ Main',
                xz: 'XZ Main',
                xysec: 'XY Secondary',
                yzsec: 'YZ Secondary',
                xzsec: 'XZ Secondary'
              },
              default: ['xy', 'yz', 'xz']
            },

            secondaryGrids: {
              type: 'text',
              title: 'Secondary grid',
              default: 2
            },

            gridOriginX: {
              type: 'text',
              title: 'Grid Origin X',
              default: ''
            },

            gridOriginY: {
              type: 'text',
              title: 'Grid Origin Y',
              default: ''
            },

            gridOriginZ: {
              type: 'text',
              title: 'Grid Origin Z',
              default: ''
            },

            projection: {
              type: 'checkbox',
              title: 'Projections',
              options: {
                show: 'Show'
              },
              default: ['show']
            },

            ticks: {
              type: 'checkbox',
              title: 'Ticks',
              options: {
                x: 'Show X tick',
                y: 'Show Y tick',
                z: 'Show Z tick',
                xlab: 'Show X tick label',
                ylab: 'Show Y tick label',
                zlab: 'Show Z tick label'
              },
              default: ['x', 'y', 'z', 'xlab', 'ylab', 'zlab']
            },

            labels: {
              type: 'combo',
              title: 'Labels',
              options: [
                { title: 'None', key: 'none' },
                { title: 'As Legend', key: 'alegend' },
                { title: 'On axis', key: 'axis' },
                { title: 'Both', key: 'both' }
              ],
              displaySource: {
                axis: 'l',
                both: 'l'
              }
            },

            xLabel: {
              type: 'text',
              title: 'X Label',
              displayTarget: ['l']
            },

            yLabel: {
              type: 'text',
              title: 'Y Label',
              displayTarget: ['l']
            },

            zLabel: {
              type: 'text',
              title: 'Z Label',
              displayTarget: ['l']
            },

            minX: {
              type: 'text',
              title: 'Min X',
              default: ''
            },

            maxX: {
              type: 'text',
              title: 'Max X',
              default: ''
            },
            minY: {
              type: 'text',
              title: 'Min Y',
              default: ''
            },

            maxY: {
              type: 'text',
              title: 'Max Y',
              default: ''
            },
            minZ: {
              type: 'text',
              title: 'Min Z',
              default: ''
            },

            maxZ: {
              type: 'text',
              title: 'Max Z',
              default: ''
            },

            backgroundColor: {
              type: 'spectrum',
              title: 'Background Color',
              default: [230, 230, 230, 1]
            },

            defaultPointColor: {
              type: 'spectrum',
              title: 'Default point color',
              default: [50, 50, 50, 1]
            },

            annotationColor: {
              type: 'spectrum',
              title: 'Annotation color',
              default: [33, 33, 33, 1]
            },
            sizeNormalization: {
              type: 'float',
              title: 'Size normalization',
              default: 0.02
            },
            '3d': {
              type: 'combo',
              title: '3D',
              options: [
                { title: 'None', key: 'none' },
                { title: 'Side-by-side', key: 'sideBySide' }
              ],
              default: 'none'
            }
          }
        },
        dataJpaths: {
          options: {
            type: 'table',
            multiple: false,
            title: 'Data jpaths'
          },
          fields: {
            x: {
              type: 'combo',
              title: 'x',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            y: {
              type: 'combo',
              title: 'y',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            z: {
              type: 'combo',
              title: 'z',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            color: {
              type: 'combo',
              title: 'color',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            size: {
              type: 'combo',
              title: 'size',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            shape: {
              type: 'combo',
              title: 'shape',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            },
            highlight: {
              type: 'combo',
              title: 'highlight',
              options: jpathPoint,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString
            }
          }
        },
        colorBar: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Color gradient (colors must be numbers)'
          },
          fields: {
            color: {
              type: 'spectrum',
              title: 'Stop color'
            },
            stopPosition: {
              type: 'float',
              title: 'Stop position',
              default: 0
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    tooltip: ['groups', 'group', 0, 'tooltip', 0],
    tooltipJpath: ['groups', 'group', 0, 'tooltipJpath', 0],
    grid: ['groups', 'group', 0, 'grid', 0],
    ticks: ['groups', 'group', 0, 'ticks', 0],
    projection: ['groups', 'group', 0, 'projection', 0],
    labels: ['groups', 'group', 0, 'labels', 0],
    minX: ['groups', 'group', 0, 'minX', 0],
    maxX: ['groups', 'group', 0, 'maxX', 0],
    minY: ['groups', 'group', 0, 'minY', 0],
    maxY: ['groups', 'group', 0, 'maxY', 0],
    minZ: ['groups', 'group', 0, 'minZ', 0],
    maxZ: ['groups', 'group', 0, 'maxZ', 0],
    xLabel: ['groups', 'group', 0, 'xLabel', 0],
    yLabel: ['groups', 'group', 0, 'yLabel', 0],
    zLabel: ['groups', 'group', 0, 'zLabel', 0],
    backgroundColor: ['groups', 'group', 0, 'backgroundColor', 0],
    defaultPointColor: ['groups', 'group', 0, 'defaultPointColor', 0],
    secondaryGrids: ['groups', 'group', 0, 'secondaryGrids', 0],
    appearance: ['groups', 'group', 0, 'appearance', 0],
    displayPointCoordinates: ['groups', 'group', 0, 'displayPointCoordinates', 0],
    annotationColor: ['groups', 'group', 0, 'annotationColor', 0],
    gridOriginX: ['groups', 'group', 0, 'gridOriginX', 0],
    gridOriginY: ['groups', 'group', 0, 'gridOriginY', 0],
    gridOriginZ: ['groups', 'group', 0, 'gridOriginZ', 0],
    sizeNormalization: ['groups', 'group', 0, 'sizeNormalization', 0],
    optimize: ['groups', 'group', 0, 'optimize', 0],
    dataJpaths: ['groups', 'dataJpaths', 0, 0],
    gradient: ['groups', 'colorBar', 0],
    '3d': ['groups', 'group', 0, '3d', 0]
  };

  return Controller;
});
