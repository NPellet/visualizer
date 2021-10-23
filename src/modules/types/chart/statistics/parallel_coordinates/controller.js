'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing'], function (Default, Traversing) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Parallel coordinates',
    description: 'Multivariate data visualization',
    author: 'Michaël Zasso',
    date: '11.03.2014',
    license: 'MIT',
    cssClass: 'parallel_coordinates'
  };

  Controller.prototype.references = {
    value: {
      type: 'array',
      label: 'An array of data points'
    },
    columns: {
      type: 'array',
      label: 'Array of column descriptions'
    },
    flagResult: {
      type: 'array',
      label: 'Array of boolean values'
    },
    countResult: {
      type: 'number',
      label: 'Number of selected items'
    }
  };

  Controller.prototype.events = {
    onBrushSelection: {
      label: 'A selection has been made',
      refVariable: ['value', 'flagResult', 'countResult']
    }
  };

  Controller.prototype.variablesIn = ['value', 'columns'];

  Controller.prototype.actionsIn = {
    addColumn: 'Add a column',
    removeColumn: 'Remove a column'
  };

  Controller.prototype.configurationStructure = function () {
    var jpaths = Traversing.getJPathsFromElement(this.module.view._value[0]);
    return {
      groups: {
        group: {
          options: {
            type: 'list',
            multiple: 'false'
          },
          fields: {
            colJPath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths
            },
            options: {
              type: 'checkbox',
              title: 'Options',
              options: {
                reorder: 'Reorderable',
                shadow: 'Keep shadows while brushing',
                hide: 'Prevent highlight of hidden lines',
                brush: 'Export selection only on brush end'
              },
              default: ['reorder']
            },
            brushMode: {
              type: 'combo',
              title: 'Brush mode',
              options: [
                { key: 'None', title: 'None' },
                { key: '1D-axes', title: '1D axes' },
                { key: '1D-axes-multi', title: '1D axes multi' },
                { key: '2D-strums', title: '2D strums' },
                { key: 'angular', title: 'Angular' }
              ],
              default: '1D-axes-multi',
              displaySource: {
                None: 'n',
                '1D-axes': 'y',
                '1D-axes-multi': 'y',
                '2D-strums': 'y',
                angular: 'y'
              }
            },
            predicate: {
              type: 'combo',
              title: 'Predicate',
              options: [
                { key: 'and', title: 'AND' },
                { key: 'or', title: 'OR' }
              ],
              default: 'and',
              displayTarget: ['y']
            }
          }
        },
        cols: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Columns'
          },
          fields: {
            name: {
              type: 'text',
              title: 'Columns name'
            },
            jpath: {
              type: 'combo',
              title: 'jPath',
              options: jpaths
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    colsjPaths: ['groups', 'cols', 0],
    colorjpath: ['groups', 'group', 0, 'colJPath', 0],
    brushMode: ['groups', 'group', 0, 'brushMode', 0],
    brushPredicate: ['groups', 'group', 0, 'predicate', 0],
    options: ['groups', 'group', 0, 'options', 0]
  };

  Controller.prototype.onBrushSelection = function (value) {
    var toSend = value,
      l = value.length;
    var original = this.module.view._value;
    var flags = new Array(original.length);

    if (value[0] && value[0].hasOwnProperty('__id')) {
      original = this.module.view._value;
      toSend = new Array(l);

      var index;
      for (var i = 0; i < l; i++) {
        index = value[i].__id;
        toSend[i] = original[index];
        flags[index] = true;
      }
    }
    this.createDataFromEvent('onBrushSelection', 'value', toSend);
    this.createDataFromEvent('onBrushSelection', 'flagResult', flags);
    this.createDataFromEvent('onBrushSelection', 'countResult', l);
  };

  return Controller;
});
