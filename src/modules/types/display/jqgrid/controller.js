'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api', 'src/util/debug'], function (Default, Traversing, API, Debug) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.init = function () {
    this.toggleElements = {};
    this.resolveReady();
  };

  Controller.prototype.moduleInformation = {
    name: 'Table',
    description: 'Displays a complex (but slower) grid with editable capability. Works async',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'jqgrid'
  };

  Controller.prototype.references = {
    row: {
      label: 'Row'
    },
    list: {
      label: 'Table'
    },
    selectedrows: {
      label: 'Selected rows'
    }
  };

  Controller.prototype.events = {
    onSelect: {
      label: 'A line is selected',
      refVariable: ['row'],
      refAction: ['row']
    },
    onHover: {
      label: 'Hovers a line',
      refVariable: ['row'],
      refAction: ['row']
    },
    onToggleOn: {
      label: 'On Toggle On',
      refVariable: ['selectedrows'],
      refAction: ['row']
    },
    onToggleOff: {
      label: 'On Toggle Off',
      refVariable: ['selectedrows'],
      refAction: ['row']
    }
  };

  Controller.prototype.variablesIn = ['list'];

  Controller.prototype.actionsIn = $.extend({}, Controller.prototype.actionsIn, {
    addRow: 'Add a new row',
    addColumn: 'Add a new column',
    removeColumn: 'Remove a column',
    removeRow: 'Remove a row'
  });

  Controller.prototype.configurationStructure = function () {
    var jpaths = this.module.model.getjPath('row', false);

    return {
      groups: {
        group: {
          options: {
            type: 'list',
            multiple: false
          },
          fields: {
            nblines: {
              type: 'float',
              title: 'Lines per page',
              default: 20
            },
            toggle: {
              type: 'combo',
              title: 'Line toggling',
              options: [
                { key: '0', title: 'No' },
                { key: 'single', title: 'Single row' },
                { key: 'multiple', title: 'Multiple rows' }
              ]
            },
            colorjpath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths
            },
            filterRow: {
              type: 'jscode',
              title: 'Filter'
            },
            highlightLine: {
              type: 'checkbox',
              title: 'Highlight on hover',
              options: {
                Yes: 'Yes'
              },
              default: ['Yes']
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
              title: 'Columns title'
            },
            jpath: {
              type: 'combo',
              title: 'jPath',
              options: jpaths
            },
            number: {
              type: 'checkbox',
              title: 'Number ?',
              options: { number: 'Yes' }
            },
            editable: {
              type: 'combo',
              title: 'Editable',
              default: 'none',
              options: [
                { key: 'none', title: 'No' },
                { key: 'text', title: 'Text' },
                { key: 'checkbox', title: 'Checkbox' },
                { key: 'select', title: 'Combo' }
              ]
            },
            options: {
              type: 'text',
              title: 'Options (; separated)'
            },
            width: {
              type: 'text',
              title: 'Width'
            }
          }
        }
      }
    };
  };

  Controller.prototype.onVarReceiveChange = function (name, rel, confSection) {
    var data = API.getVar(name);
    var jpaths = [];
    if (!data)
      return;

    if (data.getType() == 'array')
      Traversing.getJPathsFromElement(data.get(0), jpaths);
    else if (data.getType() == 'arrayXY')
      Traversing.getJPathsFromElement(data, jpaths);

    if (jpaths.length > 1)
      confSection.getGroup('cols').getField('coljpath').implementation.setOptions(jpaths);
  };

  Controller.prototype.configFunctions = {
    colsjPaths: function (cfg) {
      return cfg || [];
    }
  };

  Controller.prototype.configAliases = {
    colsjPaths: ['groups', 'cols', 0],
    nbLines: ['groups', 'group', 0, 'nblines', 0],
    toggle: ['groups', 'group', 0, 'toggle', 0],
    colorjPath: ['groups', 'group', 0, 'colorjpath', 0],
    filterRow: ['groups', 'group', 0, 'filterRow', 0],
    highlightLine: ['groups', 'group', 0, 'highlightLine', 0]
  };

  Controller.prototype.lineHover = function (elements, row) {
    this.setVarFromEvent('onHover', 'row', 'list', [row]);
    this.sendActionFromEvent('onHover', 'row', elements.get(row));
    API.highlight(elements[row], 1);
  };

  Controller.prototype.lineOut = function (elements, row) {
    var element = elements[row];
    if (!element) {
      return;
    }
    API.highlight(element, 0);
  };

  Controller.prototype.lineClick = function (elements, row) {
    this.setVarFromEvent('onSelect', 'row', 'list', [row]);
    this.sendActionFromEvent('onSelect', 'row', elements.get(row));
  };

  Controller.prototype.onToggleOn = function (elements, row) {
    this.sendActionFromEvent('onToggleOn', 'row', elements.get(row));
    this.setVarFromEvent('onToggleOn', 'row', 'list', [row]);

    this.toggleElements[row] = true;
    this.doToggle('on');
  };

  Controller.prototype.onToggleOff = function (elements, row) {
    this.sendActionFromEvent('onToggleOff', 'row', elements.get(row));
    this.setVarFromEvent('onToggleOff', 'row', 'list', [row]);

    delete this.toggleElements[row];

    this.doToggle('off');
  };

  Controller.prototype.doToggle = function (act) {
    var that = this,
      data = this.module.getDataFromRel('list');

    this.allVariablesFor((act == 'on' ? 'onToggleOn' : 'onToggleOff'), 'selectedrows', function (varToSend) {
      var results = new DataArray();

      for (var i in that.toggleElements) {
        if (!data[i]) {
          continue;
        }

        data.traceSync([i]);
        Debug.warn('Warning. This is only sync');
        var el = data[i].traceSync(varToSend.jpath.slice(0));
        results.push(el);
      }

      API.createData(varToSend.name, results, varToSend.filter);
    });
  };

  Controller.prototype.export = function () {
    return this.module.view.exportToTabDelimited();
  };

  return Controller;
});
