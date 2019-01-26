'use strict';

define(['jquery', 'modules/default/defaultcontroller'], function ($, Default) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Quill text editor',
    description: 'The quill wysiwyg editor',
    author: 'Miguel Asencio',
    date: '01.03.2018',
    license: 'MIT',
    cssClass: 'quill_editor'
  };

  Controller.prototype.references = {
    quill: {
      label: 'A Quill delta object'
    },
    html: {
      label: 'A string with html'
    },
    shortcuts: {
      label: 'An array of key / text / html object'
    }
  };

  Controller.prototype.events = {
    onEditorChange: {
      label: 'The value in the editor has changed',
      refVariable: ['quill', 'html']
    }
  };

  Controller.prototype.variablesIn = ['html', 'quill', 'shortcuts'];

  Controller.prototype.onRemove = function () {};

  Controller.prototype.valueChanged = function (value) {
    const html = this.module.view.instance.root.innerHTML;
    if (this.module.getConfigurationCheckbox('storeInView', 'yes')) {
      this.module.definition.richtext = value;
    }
    if (
      this.module.getConfigurationCheckbox('modifyVarIn', 'yes') &&
      this.module.data
    ) {
      if (this.module.view.mode === 'html') {
        this.module.data.setValue(html, true);
        this.module.model.dataTriggerChange(this.module.data);
      } else {
        this.module.model.dataSetChild(this.module.data, ['ops'], value.ops);
      }
    }
    this.createDataFromEvent('onEditorChange', 'quill', value);

    this.createDataFromEvent('onEditorChange', 'html', html);
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            editable: {
              type: 'checkbox',
              title: 'Is Editable',
              options: { isEditable: 'Yes' },
              default: ['isEditable']
            },
            toolbarMode: {
              type: 'combo',
              title: 'Toolbar',
              options: [
                { key: 'minimal', title: 'Minimal' },
                { key: 'light', title: 'Light' },
                { key: 'all', title: 'All' }
              ],
              default: 'light'
            },
            debouncing: {
              type: 'float',
              title: 'Debouncing (ms)',
              default: 0
            },
            storeInView: {
              type: 'checkbox',
              title: 'Store content in view',
              options: { yes: 'Yes' },
              default: ['yes']
            },
            modifyVarIn: {
              type: 'checkbox',
              title: 'Modify input variable',
              options: { yes: 'Yes' },
              default: []
            },
            className: {
              type: 'text',
              title: 'CSS class name',
              default: 'quill'
            },
            css: {
              type: 'jscode',
              title: 'CSS',
              mode: 'css',
              default: '.quill {}'
            }
          }
        }
      }
    };
  };

  Controller.prototype.actionsIn = {
    insertHtml: 'Insert html',
    insertText: 'Insert text'
  };

  Controller.prototype.configAliases = {
    editable: ['groups', 'group', 0, 'editable', 0],
    storeInView: ['groups', 'group', 0, 'storeInView', 0],
    debouncing: ['groups', 'group', 0, 'debouncing', 0],
    modifyVarIn: ['groups', 'group', 0, 'modifyVarIn', 0],
    toolbarMode: ['groups', 'group', 0, 'toolbarMode', 0],
    className: ['groups', 'group', 0, 'className', 0],
    css: ['groups', 'group', 0, 'css', 0]
  };

  return Controller;
});
