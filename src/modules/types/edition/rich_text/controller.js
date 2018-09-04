'use strict';

define(['jquery', 'modules/default/defaultcontroller', 'ckeditor'], function ($, Default, CKEDITOR) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Rich text editor',
    description: 'Edit rich text in a wysiwyg interface.',
    author: 'Michaël Zasso',
    date: '21.05.2014',
    license: 'MIT',
    cssClass: 'rich_text'
  };

  Controller.prototype.references = {
    html: {
      label: 'Content as HTML'
    }
  };

  Controller.prototype.events = {
    onEditorChange: {
      label: 'The value in the editor has changed',
      refVariable: ['html']
    }
  };

  Controller.prototype.variablesIn = ['html'];

  Controller.prototype.onRemove = function () {
    if (CKEDITOR.instances[this.module.view._id]) {
      CKEDITOR.instances[this.module.view._id].destroy();
    }
  };

  Controller.prototype.valueChanged = function (value) {
    this.module.definition.richtext = value;
    if (this.module.getConfigurationCheckbox('modifyInVariable', 'yes') && this.module.data) {
      this.module.data.setValue(value, true);
      this.module.model.dataTriggerChange(this.module.data);
    }
    this.createDataFromEvent('onEditorChange', 'html', DataObject.check({
      type: 'html',
      value: value
    }, true));
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
            debouncing: {
              type: 'float',
              title: 'Debouncing (ms)',
              default: 0
            },
            modifyInVariable: {
              type: 'checkbox',
              title: 'Modify Input Variable',
              options: { yes: 'Yes' },
              default: []
            },
            storeInView: {
              type: 'checkbox',
              title: 'Store content in view',
              options: { yes: 'Yes' },
              default: ['yes']
            },
            autoHeight: {
              type: 'checkbox',
              title: 'Automatic Height',
              options: { yes: 'Yes' },
              default: []
            },
            bgColor: {
              type: 'spectrum',
              title: 'Background color',
              default: [255, 255, 255, 1]
            },
            postit: {
              type: 'checkbox',
              title: 'Looks like a postit',
              options: { yes: 'Yes' },
              default: []
            },
            html: {
              type: 'checkbox',
              title: 'Render plain html',
              options: { yes: 'Yes' },
              default: ['yes']
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
    modifyInVariable: ['groups', 'group', 0, 'modifyInVariable', 0],
    storeInView: ['groups', 'group', 0, 'storeInView', 0],
    autoHeight: ['groups', 'group', 0, 'autoHeight', 0],
    bgColor: ['groups', 'group', 0, 'bgColor', 0],
    postit: ['groups', 'group', 0, 'postit', 0],
    plainHtml: ['groups', 'group', 0, 'html', 0],
    debouncing: ['groups', 'group', 0, 'debouncing', 0]
  };

  return Controller;
});
