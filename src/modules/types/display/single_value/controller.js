'use strict';

define([
  'modules/default/defaultcontroller',
  'src/util/util',
  'src/util/typerenderer',
], function (Default, Util, Renderer) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Display value',
    description: 'Display a displayable element',
    author: 'Norman Pellet',
    date: '24.12.2013',
    license: 'MIT',
    cssClass: 'single_value',
  };

  Controller.prototype.references = {
    value: {
      label: 'Any displayable object',
    },
    color: {
      type: 'string',
      label: 'A color to fill the module with',
    },
  };

  Controller.prototype.variablesIn = ['value', 'color'];

  Controller.prototype.configurationStructure = function () {
    var typeList = Renderer.getRendererComboOptions();
    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            append: {
              type: 'checkbox',
              title: 'Append values',
              options: {
                yes: 'Yes',
              },
              displaySource: {
                yes: 'a',
              },
            },
            maxEntries: {
              type: 'float',
              title: 'Max entries',
              default: 1,
              displayTarget: ['a'],
            },
            editable: {
              title: 'Editable',
              type: 'checkbox',
              options: {
                yes: 'Yes',
              },
              default: [],
            },
            editSearchRegexp: {
              type: 'text',
              title: 'Regexp search after edit',
            },
            editReplace: {
              type: 'text',
              title: 'Replace after edit',
            },
            debounce: {
              type: 'float',
              default: 0,
              title: 'Debouncing (ms)',
            },
            defaultvalue: {
              type: 'wysiwyg',
              title: 'Default value',
            },
            font: {
              type: 'combo',
              title: 'Font',
              options: Util.getWebsafeFonts(),
            },
            fontcolor: {
              type: 'spectrum',
              title: 'Font color',
            },
            fontsize: {
              type: 'combo',
              title: 'Font size',
              options: [
                { title: '8pt', key: '8pt' },
                { title: '9pt', key: '9pt' },
                { title: '10pt', key: '10pt' },
                { title: '11pt', key: '11pt' },
                { title: '12pt', key: '12pt' },
                { title: '13pt', key: '13pt' },
                { title: '14pt', key: '14pt' },
                { title: '18pt', key: '18pt' },
                { title: '24pt', key: '24pt' },
                { title: '30pt', key: '30pt' },
                { title: '36pt', key: '36pt' },
                { title: '48pt', key: '48pt' },
                { title: '64pt', key: '64pt' },
              ],
            },
            align: {
              type: 'combo',
              title: 'Alignment',
              options: [
                { title: 'Left', key: 'left' },
                { title: 'Center', key: 'center' },
                { title: 'Right', key: 'right' },
              ],
            },
            valign: {
              type: 'combo',
              title: 'Vertical align',
              options: [
                { title: 'Top', key: 'top' },
                { title: 'Middle', key: 'middle' },
                { title: 'Bottom', key: 'bottom' },
              ],
            },
            rendererOptions: {
              type: 'text',
              title: 'Renderer options',
              default: '',
            },
            forceType: {
              type: 'combo',
              options: typeList,
              title: 'Force type',
              default: '',
            },
            sprintf: {
              type: 'text',
              title: 'Sprintf',
            },
            sprintfOrder: {
              type: 'text',
              title: 'Sprintf var order',
              multiple: true,
            },
            preformatted: {
              type: 'checkbox',
              title: 'Display options',
              options: {
                pre: 'Display as preformatted text',
                selectable: 'Make text selectable',
              },
              default: [],
            },
          },
        },
      },
    };
  };

  Controller.prototype.export = function () {
    return this.module.view.exportToHTML();
  };

  Controller.prototype.configAliases = {
    editable: ['groups', 'group', 0, 'editable', 0],
    fontcolor: ['groups', 'group', 0, 'fontcolor', 0],
    font: ['groups', 'group', 0, 'font', 0],
    fontsize: ['groups', 'group', 0, 'fontsize', 0],
    align: ['groups', 'group', 0, 'align', 0],
    valign: ['groups', 'group', 0, 'valign', 0],
    defaultvalue: ['groups', 'group', 0, 'defaultvalue', 0],
    sprintf: ['groups', 'group', 0, 'sprintf', 0],
    rendererOptions: ['groups', 'group', 0, 'rendererOptions', 0],
    forceType: ['groups', 'group', 0, 'forceType', 0],
    editSearchRegexp: ['groups', 'group', 0, 'editSearchRegexp', 0],
    editReplace: ['groups', 'group', 0, 'editReplace', 0],
    debounce: ['groups', 'group', 0, 'debounce', 0],
    sprintfOrder: ['groups', 'group', 0, 'sprintfOrder'],
    preformatted: ['groups', 'group', 0, 'preformatted', 0],
    append: ['groups', 'group', 0, 'append', 0],
    maxEntries: ['groups', 'group', 0, 'maxEntries', 0],
  };

  return Controller;
});
