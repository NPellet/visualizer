'use strict';

define(['jquery', 'modules/default/defaultcontroller'], function ($, Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Twig template',
    description: 'Display parts of an object using a twig template',
    author: 'Michaël Zasso',
    date: '02.04.2014',
    license: 'MIT',
    cssClass: 'twig'
  };

  Controller.prototype.references = {
    value: {
      label: 'Any object'
    },
    tpl: {
      label: 'Template',
      type: 'string'
    },
    renderedHtml: {
      label: 'Rendered HTML',
      type: 'string'
    },
    form: {
      label: 'Form object'
    },
    formFull: {
      label: 'Form object with meta informations'
    },
    style: {
      label: 'Style object'
    }
  };

  Controller.prototype.events = {
    onRendered: {
      label: 'Html was rendered',
      refVariable: ['renderedHtml'],
      refAction: ['renderedHtml']
    },
    onFormChanged: {
      label: 'Form changed',
      refVariable: ['form', 'formFull'],
      refAction: ['form', 'formFull']
    },
    onFormSubmitted: {
      label: 'Form submitted',
      refVariable: ['form', 'formFull'],
      refAction: ['form', 'formFull']
    }
  };

  Controller.prototype.variablesIn = ['value', 'tpl', 'form', 'style'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            selectable: {
              type: 'checkbox',
              title: 'Selectable',
              options: {
                yes: 'Yes'
              }
            },
            template: {
              type: 'jscode',
              title: 'Template',
              mode: 'html',
              default: ''
            },
            modifyInForm: {
              type: 'checkbox',
              title: 'Modify form in',
              options: {
                yes: 'Yes'
              }
            },
            debouncing: {
              type: 'float',
              title: 'Debouncing',
              default: 0
            },
            formOptions: {
              type: 'checkbox',
              title: 'Form options',
              options: {
                keepFormValueIfDataUndefined: 'Keep form value if data undefined'
              },
              default: ['keepFormValueIfDataUndefined']
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    template: ['groups', 'group', 0, 'template', 0],
    selectable: ['groups', 'group', 0, 'selectable', 0],
    modifyInForm: ['groups', 'group', 0, 'modifyInForm', 0],
    debouncing: ['groups', 'group', 0, 'debouncing', 0],
    formOptions: ['groups', 'group', 0, 'formOptions', 0]
  };

  Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
    clearForm: 'Clear form',
    setForm: 'Set form values'
  });

  Controller.prototype.onRendered = function (renderedHtml) {
    setTimeout(() => { // Figure out why I have to set timeout
      this.createDataFromEvent('onRendered', 'renderedHtml', renderedHtml);
      this.sendActionFromEvent('onRendered', 'renderedHtml', renderedHtml);
    }, 0);
  };

  Controller.prototype.onFormChanged = function (event, noChange) {
    this._doForm('onFormChanged', event, noChange);
  };

  Controller.prototype.onFormSubmitted = function (event) {
    this._doForm('onFormSubmitted', event);
  };


  Controller.prototype._doForm = function (name, data, noChange) {
    this.createDataFromEvent(name, 'form', data.data);
    this.sendActionFromEvent(name, 'form', data.data);
    this.createDataFromEvent(name, 'formFull', data);
    this.sendActionFromEvent(name, 'formFull', data);

    if (!noChange && this.module.getConfigurationCheckbox('modifyInForm', 'yes') && this.module.view.formObject) {
      this.module.view.formObject.mergeWith(DataObject.resurrect(data.data), this.module.getId());
    }
  };

  return Controller;
});
