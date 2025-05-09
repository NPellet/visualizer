'use strict';

define([
  'modules/default/defaultcontroller',
  'src/util/util',
  'lodash',
  'src/util/api',
  'src/util/typerenderer',
], function (Default, Util, _, API, Renderer) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Slick Grid',
    description: 'Table editor based on SlickGrid',
    author: 'Daniel Kostro',
    date: '14.10.2014',
    license: 'MIT',
    cssClass: 'slickgrid',
  };

  Controller.prototype.configurationStructure = function () {
    const typeList = Renderer.getRendererComboOptions();

    const jpaths = this.module.model.getjPath('row', false);

    return {
      groups: {
        group: {
          options: {
            type: 'list',
            multiple: false,
          },
          fields: {
            slickCheck: {
              type: 'checkbox',
              title: 'Slick options',
              options: {
                editable: 'Selectable / Editable',
                enableAddRow: 'Enable add row',
                autoEdit: 'Enable Auto Edit',
                forceFitColumns: 'Force fit Columns',
                rowNumbering: 'Show row number when scrolling',
                oneUncollapsed: 'Maximum One group uncollapsed (per level)',
                filterColumns: 'Enable search header',
                keepSelected: 'Keep selected elements when filtering',
                backToTop: "Don't remember scroll position",
                forgetLastSelected: "Don't remember last selected rows",
                forgetLastActive: "Don't remember last active cell",
                highlightScroll: 'Scroll to highlighted line',
                collapseGroup: 'Collapse groups on start',
                ignoreMyHighlights: 'Ignore highlights from myself',
              },
              default: [
                'enableCellNavigation',
                'rowNumbering',
                'forceFitColumns',
                'highlightScroll',
                'forgetLastActive',
              ],
            },
            copyPaste: {
              type: 'checkbox',
              title: 'Allow copy paste',
              options: { active: 'Yes' },
              displaySource: {
                active: 'cp',
              },
              default: [],
            },
            copyPasteOptions: {
              type: 'checkbox',
              title: 'Copy paste options',
              options: {
                readOnly: 'Read only',
                newRows: 'Paste to new rows when overflowing',
                noAutoFocus: 'Disable auto focus when row selection changes',
              },
              displayTarget: ['cp'],
              default: ['newRows'],
            },
            autoColumns: {
              type: 'checkbox',
              title: 'Auto Columns',
              options: {
                remove: 'Remove row',
                select: 'Select row',
                reorder: 'Reorder',
              },
              default: [],
            },
            toolbar: {
              type: 'checkbox',
              title: 'Toolbar options',
              options: {
                add: 'New row',
                update: 'Update row',
                remove: 'Remove row',
                showHide: 'Show/hide column',
              },
              default: [],
            },
            colorjpath: {
              type: 'combo',
              title: 'Color jPath',
              options: jpaths,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString,
            },
            'slick.defaultColumnWidth': {
              type: 'float',
              title: 'Default Column Width',
            },

            'slick.rowHeight': {
              type: 'text',
              title: 'Row Height',
            },

            'slick.headerRowHeight': {
              type: 'float',
              title: 'Header row height',
              default: 30,
            },

            'slick.selectionModel': {
              type: 'combo',
              title: 'Selection',
              options: [
                { key: 'row', title: 'Row Selection Model' },
                { key: 'cell', title: 'Cell Selection Model' },
              ],
              default: 'row',
            },
            idProperty: {
              type: 'text',
              title: 'Id property',
              default: '',
            },
            filterType: {
              type: 'combo',
              title: 'Filter script source',
              options: [
                {
                  key: 'pref',
                  title: 'Define in preferences',
                },
                { key: 'invar', title: 'From input variable' },
              ],
              displaySource: { pref: 'p', invar: 'i' },
              default: 'pref',
            },
            filterRow: {
              type: 'jscode',
              title: 'Filter',
              default:
                '// Documentation: https://github.com/NPellet/visualizer/blob/46b40ca86345f8fa313563bf9c6ecb80ba323101/src/modules/types/edition/slick_grid/view.js#L1695-L1735',
              displayTarget: ['p'],
            },
            customJpaths: {
              type: 'text',
              title: 'Custom jpaths',
              default: '',
            },
          },
        },
        cols: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Columns',
          },
          fields: {
            name: {
              type: 'text',
              title: 'Column ID (mandatory)',
            },
            jpath: {
              type: 'combo',
              title: 'jPath',
              options: jpaths,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString,
            },
            editor: {
              type: 'combo',
              title: 'Editor',
              default: 'none',
              options: [
                { key: 'none', title: 'None' },
                { key: 'auto', title: 'Based on type' },
                { key: 'string', title: 'String' },
                { key: 'number', title: 'Number' },
                { key: 'boolean', title: 'Boolean' },
                { key: 'jpath', title: 'JPath' },
                { key: 'color', title: 'Color' },
                { key: 'date', title: 'Date' },
                { key: 'longtext', title: 'Long Text' },
                { key: 'select', title: 'Select' },
                { key: 'unit', title: 'Unit' },
                { key: 'valueunits', title: 'Value Units' },
              ],
            },
            forceType: {
              type: 'combo',
              title: 'Force type',
              default: '',
              options: typeList,
            },
            formatter: {
              type: 'combo',
              title: 'Formatter',
              options: [
                {
                  key: 'typerenderer',
                  title: 'Type Renderer',
                },
              ],
              default: 'typerenderer',
            },
            copyFormatter: {
              type: 'combo',
              title: 'Copy formatter',
              options: [
                { key: 'default', title: 'Default' },
                {
                  key: 'OCLToMolfile',
                  title: 'OCL to molfile',
                },
              ],
              default: 'default',
            },
            visibility: {
              type: 'combo',
              title: 'Visibility',
              options: [
                { key: 'both', title: 'Main and Popup' },
                { key: 'main', title: 'Main' },
                { key: 'popup', title: 'Popup' },
              ],
              default: 'both',
            },

            rendererOptions: {
              type: 'text',
              title: 'Renderer Options',
              default: '',
            },
            editorOptions: {
              type: 'text',
              title: 'Editor options',
              default: '',
            },
            width: {
              type: 'text',
              title: 'Width',
            },
            minWidth: {
              type: 'text',
              title: 'Min Width',
            },
            maxWidth: {
              type: 'text',
              title: 'Max Width',
            },
            hideColumn: {
              type: 'checkbox',
              title: 'Hide column at init',
              options: {
                yes: 'Yes',
              },
              default: [],
            },
          },
        },
        actionCols: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Action columns',
          },
          fields: {
            name: {
              type: 'text',
              title: 'Column ID (mandatory)',
            },
            tooltip: {
              type: 'text',
              title: 'Tooltip',
            },
            icon: {
              type: 'text',
              title: 'Icon',
            },
            backgroundColor: {
              type: 'spectrum',
              title: 'Background Color',
              default: [255, 255, 255, 0],
            },
            color: {
              type: 'spectrum',
              title: 'Color',
              default: [0, 0, 0, 1],
            },
            action: {
              type: 'text',
              title: 'Action to send',
            },
            position: {
              type: 'combo',
              title: 'Position',
              options: [
                { key: 'begin', title: 'Begin' },
                { key: 'end', title: 'End' },
              ],
              default: 'end',
            },
            clickMode: {
              type: 'combo',
              title: 'Click mode',
              options: [
                { key: 'text', title: 'Text or icon' },
                { key: 'background', title: 'Background' },
              ],
              default: 'text',
            },
            width: {
              type: 'text',
              title: 'Width',
            },
            minWidth: {
              type: 'text',
              title: 'Min Width',
            },
            maxWidth: {
              type: 'text',
              title: 'Max Width',
            },
          },
        },
        groupings: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Groupings',
          },

          fields: {
            getter: {
              type: 'combo',
              title: 'jPath',
              options: jpaths,
              extractValue: Util.jpathToArray,
              insertValue: Util.jpathToString,
            },
            groupName: {
              type: 'text',
              title: 'Group Name',
            },
          },
        },
        actionOutButtons: {
          options: {
            type: 'table',
            multiple: true,
            title: 'Action out buttons',
          },
          fields: {
            actionName: {
              type: 'text',
              title: 'Action name',
            },
            buttonTitle: {
              type: 'text',
              title: 'Button title',
            },
          },
        },
        data: {
          options: {
            type: 'list',
            title: 'Data',
          },
          fields: {
            saveInView: {
              type: 'checkbox',
              title: 'Save in view',
              options: {
                yes: 'yes',
              },
              displaySource: { yes: 'saveInView' },
              default: [],
            },
            varname: {
              type: 'text',
              title: 'Variable name',
              default: '',
              displayTarget: ['saveInView'],
            },
            data: {
              type: 'jscode',
              title: 'Data',
              default: '[]',
              displayTarget: ['saveInView'],
            },
          },
        },
      },
    };
  };

  Controller.prototype.onBeforeSave = function (formValue) {
    var varname = formValue.module_specific_config[0].groups.data[0].varname[0];
    var saveInView =
      formValue.module_specific_config[0].groups.data[0].saveInView[0].length;
    var vars_in = formValue.vars_in[0].groups.group[0];
    var varin = vars_in[0];
    if (varname && saveInView) {
      if (varin && varin.name) {
        varin.name = varname;
      } else {
        vars_in.push({
          rel: 'list',
          name: varname,
        });
      }
    } else if (!saveInView) {
      formValue.vars_in[0].groups.group[0] = vars_in.filter(function (v) {
        return v.name !== varname;
      });
    }
  };

  Controller.prototype.configAliases = {
    colorjPath: ['groups', 'group', 0, 'colorjpath', 0],
    slickCheck: ['groups', 'group', 0, 'slickCheck', 0],
    copyPasteOptions: ['groups', 'group', 0, 'copyPasteOptions', 0],
    copyPaste: ['groups', 'group', 0, 'copyPaste', 0],
    'slick.rowHeight': ['groups', 'group', 0, 'slick.rowHeight', 0],
    'slick.headerRowHeight': ['groups', 'group', 0, 'slick.headerRowHeight', 0],
    'slick.selectionModel': ['groups', 'group', 0, 'slick.selectionModel', 0],
    'slick.defaultColumnWidth': [
      'groups',
      'group',
      0,
      'slick.defaultColumnWidth',
      0,
    ],
    idProperty: ['groups', 'group', 0, 'idProperty', 0],
    filterType: ['groups', 'group', 0, 'filterType', 0],
    filterRow: ['groups', 'group', 0, 'filterRow', 0],
    cols: ['groups', 'cols', 0],
    actionCols: ['groups', 'actionCols', 0],
    groupings: ['groups', 'groupings', 0],
    actionOutButtons: ['groups', 'actionOutButtons', 0],
    toolbar: ['groups', 'group', 0, 'toolbar', 0],
    autoColumns: ['groups', 'group', 0, 'autoColumns', 0],
    customJpaths: ['groups', 'group', 0, 'customJpaths', 0],
    saveInView: ['groups', 'data', 0, 'saveInView', 0],
    data: ['groups', 'data', 0, 'data', 0],
    varname: ['groups', 'data', 0, 'varname', 0],
  };

  Controller.prototype.references = {
    row: {
      label: 'Row',
    },
    list: {
      label: 'Table',
      type: 'array',
    },
    script: {
      label: 'Filter script',
      type: 'string',
    },
    rows: {
      label: 'Row selection',
      type: 'array',
    },
  };

  Controller.prototype.variablesIn = ['list', 'script'];

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    hoverRow: 'Mimic row hover',
    selectRow: 'Mimic cell click',
    selectRows: 'Set selected rows',
    unselectRows: 'Unselect rows from current selection',
    scrollToRow: 'Scroll to row',
    unsetActiveRow: 'Unset active row',
    selectRowsAdd: 'Add selected rows to current selection',
    addRow: 'Add new row(s)',
    appendRow: 'Append new row(s)',
    prependRow: 'Prepend new row(s)',
    insertRow: 'insert new row(s)',
    showColumn: 'Show a column',
    hideColumn: 'Hide a column',
    toggleColumn: "Toggle a column's visibility",
    rerender: 'Rerender the grid',
  });

  Controller.prototype.events = {
    onSelect: {
      label: 'Row clicked',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onDoubleClick: {
      label: 'Row double clicked',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onHover: {
      label: 'Row hovered',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onRowChange: {
      label: 'Row changed',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onRowNew: {
      label: 'Row added',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onRowsDelete: {
      label: 'Rows deleted',
      refVariable: ['rows'],
      refAction: ['rows'],
    },
    onRowActive: {
      label: 'Row activated',
      refVariable: ['row'],
      refAction: ['row'],
    },
    onRowsSelect: {
      label: 'Rows selected',
      refVariable: ['rows'],
      refAction: ['rows'],
    },
    onLastSelectedRow: {
      label: 'Last selected row',
      refVariable: ['row'],
      refAction: ['row'],
    },
  };

  Controller.prototype.onLastSelectedRow = function (row, item) {
    this.setVarFromEvent('onLastSelectedRow', 'row', 'list', [row]);
    this.sendActionFromEvent('onLastSelectedRow', 'row', item);
  };

  Controller.prototype.unselectLastRow = function () {
    this.createDataFromEvent('onLastSelectedRow', 'row');
    this.sendActionFromEvent('onRowActive', 'row', null);
  };

  Controller.prototype.onRowsSelected = function (items) {
    items = items.filter(function (v) {
      return !!v;
    });
    this.createDataFromEvent('onRowsSelect', 'rows', items);
    this.sendActionFromEvent('onRowsSelect', 'rows', items);
  };

  Controller.prototype.onHover = function (row, item) {
    var itemId = item[this.module.view.idPropertyName];
    if (this.lastHoveredItemId === itemId) return;
    this.lastHoveredItemId = itemId;
    this.setVarFromEvent('onHover', 'row', 'list', [row]);
    this.sendActionFromEvent('onHover', 'row', item);
  };

  Controller.prototype.onClick = _.throttle(
    function (row, item) {
      this.lastClickedItem = item;
      this.setVarFromEvent('onSelect', 'row', 'list', [row]);
      this.sendActionFromEvent('onSelect', 'row', item);
    },
    250,
    { trailing: false },
  );

  Controller.prototype.unselectRow = function () {
    this.createDataFromEvent('onSelect', 'row');
    this.createDataFromEvent('onRowActive', 'row');
  };

  Controller.prototype.onDoubleClick = function (row, item) {
    this.setVarFromEvent('onDoubleClick', 'row', 'list', [row]);
    this.sendActionFromEvent('onDoubleClick', 'row', item);
  };

  Controller.prototype.onActive = function (row, item) {
    this.setVarFromEvent('onRowActive', 'row', 'list', [row]);
    this.sendActionFromEvent('onRowActive', 'row', item);
  };

  Controller.prototype.onRowChange = function (row, item) {
    this.setVarFromEvent('onRowChange', 'row', 'list', [row]);
    this.sendActionFromEvent('onRowChange', 'row', item);
  };

  Controller.prototype.onRowNew = function (row, item) {
    this.setVarFromEvent('onRowNew', 'row', 'list', [row]);
    this.sendActionFromEvent('onRowNew', 'row', item);
  };

  Controller.prototype.onRowsDelete = function (items) {
    this.createDataFromEvent('onRowsDelete', 'rows', items);
    this.sendActionFromEvent('onRowsDelete', 'rows', items);
  };

  Controller.prototype.export = function () {
    return this.module.view.exportToTabDelimited();
  };

  Controller.prototype.sendActionButton = function (name, items) {
    API.doAction(name, items);
  };

  return Controller;
});
