'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/util'], function (Default, Traversing, Util) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Hexagonal map',
    description: 'Display hexagonal map',
    author: 'Daniel Kostro',
    date: '13.05.2015',
    license: 'MIT'
  };

  Controller.prototype.references = {
    chart: {
      label: 'Chart data'
    }
  };

  Controller.prototype.variablesIn = ['chart'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {

        group: {
          options: {
            type: 'list',
            multiple: false
          },

          fields: {
            coordinateSystem: {
              type: 'combo',
              title: 'Coordinate system',
              options: [
                { key: 'combinatorial', title: 'Combinatorial' },
                { key: 'cubic', title: 'Cubic' },
                { key: 'evenq', title: 'Even-q' },
                { key: 'oddr', title: 'Odd-r' }
              ],
              default: 'combinatorial',
              displaySource: {
                combinatorial: 'comb'
              }
            },
            originX: {
              type: 'float',
              title: 'Origin X',
              displayTarget: ['comb'],
              default: 0
            },
            originY: {
              type: 'float',
              title: 'Origin Y',
              displayTarget: ['comb'],
              default: 0
            },
            originZ: {
              type: 'float',
              title: 'Origin Z',
              displayTarget: ['comb'],
              default: 0
            },
            fontSize: {
              type: 'float',
              title: 'Font size (empty=auto)'
            },
            axesType: {
              type: 'combo',
              title: 'Axes type',
              options: [
                { key: 'graph', title: 'On graph' },
                { key: 'legend', title: 'As Legend' },
                { key: 'none', title: 'None' }
              ],
              default: 'graph'
            },
            showColorBar: {
              type: 'checkbox',
              title: 'Color bar',
              options: { show: 'Show' },
              default: []
            },
            enableZoom: {
              type: 'checkbox',
              title: 'Enable pan & zoom',
              options: { yes: 'Yes' },
              default: []
            }
          }
        },
        colorBarOpt: {
          options: {
            type: 'list',
            multiple: true,
            title: 'Color bar options'
          },
          fields: {
            stopType: {
              type: 'combo',
              title: 'Stop type',
              options: [
                { key: 'percent', title: 'Percent - Stop positions are given as percent of domain (0 -> 1)' },
                { key: 'values', title: 'Values (Stop positions are directly given)' }
              ],
              default: 'percent'
            },
            tickMode: {
              type: 'combo',
              title: 'Ticks',
              options: [
                { key: 'auto', title: 'Automatic' },
                { key: 'manual', title: 'Manual' }
              ],
              default: 'auto',
              displaySource: {
                auto: 'a',
                manual: 'm'
              }
            },
            tickNumber: {
              type: 'float',
              title: 'Number of ticks',
              default: 5,
              displayTarget: ['a']
            },
            tickValues: {
              type: 'text',
              title: 'Tick values (,-separated)',
              default: '',
              displayTarget: ['m']
            }
          }
        },
        colorBar: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Color bar (colors must be numbers)'
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
    coordinateSystem: ['groups', 'group', 0, 'coordinateSystem', 0],
    originX: ['groups', 'group', 0, 'originX', 0],
    originY: ['groups', 'group', 0, 'originY', 0],
    originZ: ['groups', 'group', 0, 'originZ', 0],
    fontSize: ['groups', 'group', 0, 'fontSize', 0],
    axesType: ['groups', 'group', 0, 'axesType', 0],
    gradient: ['groups', 'colorBar', 0],
    stopType: ['groups', 'colorBarOpt', 0, 'stopType', 0],
    tickMode: ['groups', 'colorBarOpt', 0, 'tickMode', 0],
    tickNumber: ['groups', 'colorBarOpt', 0, 'tickNumber', 0],
    tickValues: ['groups', 'colorBarOpt', 0, 'tickValues', 0],
    showColorBar: ['groups', 'group', 0, 'showColorBar', 0],
    enableZoom: ['groups', 'group', 0, 'enableZoom', 0]
  };

  return Controller;
});
