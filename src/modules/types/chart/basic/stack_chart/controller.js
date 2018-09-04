'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api'], function (Default, Traversing, API) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Stack chart',
    description: 'Display a Bars or Line or points chart based on flot',
    author: 'Khalid Arroub',
    date: '07.01.2014',
    license: 'MIT',
    cssClass: 'stack_chart'
  };

  Controller.prototype.events = {
    onHover: {
      label: 'Hover a piece of chart',
      refVariable: ['piece']
    }
  };

  Controller.prototype.onHover = function (element) {
    if (!element) {
      return;
    }
    this.setVarFromEvent('onHover', element, 'piece');
  };

  Controller.prototype.references = {
    chart: {
      type: ['chart', 'object'],
      label: 'A json describing a chart'
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

  Controller.prototype.variablesIn = ['chart'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            preference: {
              type: 'combo',
              title: 'Chart Type',
              default: 'Lines',
              options: [
                { title: 'Bars', key: 'Bars' },
                { title: 'Lines', key: 'Lines' },
                {
                  title: 'Lines With Steps',
                  key: 'Lines With Steps'
                }
              ],
              displaySource: {
                Bars: 'b',
                Lines: 'l',
                'Lines With Steps': 'ls'

              }
            },
            stack: {
              type: 'checkbox',
              title: 'Stack',
              default: false,
              options: { stack: 'Stacking the series together' }
            },
            barWidth: {
              type: 'combo',
              title: 'Bars Width',
              options: [
                { title: '0.3', key: 0.3 },
                { title: '0.4', key: 0.4 },
                { title: '0.5', key: 0.5 },
                { title: '0.6', key: 0.6 },
                { title: '0.7', key: 0.7 },
                { title: '0.8', key: 0.8 },
                { title: '0.9', key: 0.9 }
              ],

              displayTarget: ['b']
            },
            fill: {
              type: 'checkbox',
              default: false,
              title: 'Fill',
              options: { fill: 'Filling under lines' },
              displayTarget: ['l', 'ls']
            },
            xLabel: {
              type: 'text',
              title: 'X Axis Label'
            },

            yLabel: {
              type: 'text',
              title: 'Y Axis Label'
            },

            xLabelHeight: {
              type: 'text',
              title: 'X Axis label Height'
            },
            xLabelWidth: {
              type: 'text',
              title: 'X Axis label Width'
            },
            yLabelHeight: {
              type: 'text',
              title: 'Y Axis label Height'
            },
            yLabelWidth: {
              type: 'text',
              title: 'Y Axis label Width'
            }

          }
        }
      }
    };
  };

  Controller.prototype.configFunctions = {
    stack: function (cfg) {
      return cfg.indexOf('stack') != -1;
    },
    fill: function (cfg) {
      return cfg.indexOf('fill') != -1;
    }
  };

  Controller.prototype.configAliases = {
    preference: ['groups', 'group', 0, 'preference', 0],
    barWidth: ['groups', 'group', 0, 'barWidth', 0],
    stack: ['groups', 'group', 0, 'stack', 0],
    fill: ['groups', 'group', 0, 'fill', 0],
    xLabel: ['groups', 'group', 0, 'xLabel', 0],
    yLabel: ['groups', 'group', 0, 'yLabel', 0],
    xLabelHeight: ['groups', 'group', 0, 'xLabelHeight', 0],
    xLabelWidth: ['groups', 'group', 0, 'xLabelWidth', 0],
    yLabelHeight: ['groups', 'group', 0, 'yLabelHeight', 0],
    yLabelWidth: ['groups', 'group', 0, 'yLabelWidth', 0]
  };

  return Controller;
});
