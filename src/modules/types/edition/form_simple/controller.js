'use strict';

define(['modules/default/defaultcontroller', 'lib/formcreator/formcreator', 'src/util/datatraversing'], function (Default, FormCreator, Traversing) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Simple Form',
    description: 'A simple module allowing one to display a form in the module',
    author: 'Norman Pellet, Michaël Zasso',
    date: '01.09.2014',
    license: 'MIT',
    cssClass: 'form_simple'
  };

  Controller.prototype.references = {
    input_object: {
      label: 'Input object',
      type: 'object'
    },
    output_object: {
      type: 'object',
      label: 'Output object'
    },
    formatted_output: {
      type: 'object',
      label: 'Formatted output object'
    }
  };

  Controller.prototype.events = {
    onChange: {
      label: 'Form has changed',
      refVariable: ['output_object', 'formatted_output'],
      refAction: ['output_object', 'formatted_output']
    },

    formTriggered: {
      label: 'The button was clicked',
      refAction: ['output_object', 'formatted_output'],
      refVariable: ['output_object', 'formatted_output']
    }
  };

  Controller.prototype.variablesIn = ['input_object'];

  Controller.prototype.configurationStructure = function () {
    var jpaths = [];
    var arr = this.module.getDataFromRel('input_object');

    if (arr) {
      arr = arr.get();
      Traversing.getJPathsFromElement(arr, jpaths);
    }

    return {
      sections: {
        structure: FormCreator.makeConfig({
          jpaths: jpaths,
          name: 'Fill with'
        }),
        trigger: {
          options: { title: 'Trigger' },
          groups: {
            trigger: {
              options: { type: 'list' },
              fields: {
                triggerType: {
                  type: 'combo',
                  title: 'Trigger type',
                  options: [
                    { key: 'btn', title: 'Button' },
                    { key: 'change', title: 'On change' },
                    { key: 'both', title: 'Both' }
                  ],
                  displaySource: {
                    btn: 'btn',
                    change: 'change',
                    both: 'both'
                  }
                },
                buttonLabel: {
                  type: 'text',
                  title: 'Button label',
                  default: 'OK',
                  displayTarget: ['btn', 'both']
                },
                debounce: {
                  type: 'float',
                  title: 'Debounce',
                  default: 0,
                  displayTarget: ['change', 'both']
                }
              }
            }
          }
        },
        formdata: {
          options: {
            title: 'Form data'
          },
          groups: {
            formdata: {
              options: {
                type: 'list',
                multiple: false
              },
              fields: {
                replaceEntryVar: {
                  type: 'checkbox',
                  title: 'Replace entry variable',
                  options: { replace: '' }
                }
              }
            }
          }
        },
        template: {
          options: {
            title: 'Template'
          },
          groups: {
            template: {
              options: {
                type: 'list',
                multiple: false
              },
              fields: {
                file: {
                  type: 'text',
                  title: 'Template file'
                },
                html: {
                  type: 'jscode',
                  title: 'HTML template',
                  mode: 'html',
                  default: '<span class="form-dyn" data-form-content="field:name:label"></span>\n<div class="form-dyn" data-form-content="field:name:dom"></div>'
                }
              }
            }
          }
        }
      }
    };
  };

  Controller.prototype.configFunctions = {
    replaceObj: function (val) {
      return val == 'replace';
    }
  };

  Controller.prototype.configAliases = {
    structure: ['sections', 'structure'],
    tpl_file: ['sections', 'template', 0, 'groups', 'template', 0, 'file', 0],
    tpl_html: ['sections', 'template', 0, 'groups', 'template', 0, 'html', 0],
    trigger: ['sections', 'trigger', 0, 'groups', 'trigger', 0, 'triggerType', 0],
    debounce: ['sections', 'trigger', 0, 'groups', 'trigger', 0, 'debounce', 0],
    replaceObj: ['sections', 'formdata', 0, 'groups', 'formdata', 0, 'replaceEntryVar', 0, 0],
    btnLabel: ['sections', 'trigger', 0, 'groups', 'trigger', 0, 'buttonLabel', 0]
  };

  Controller.prototype.valueChanged = function (newValue) {
    if (this.module.getConfiguration('replaceObj')) {
      this.setVarFromEvent('onChange', 'output_object', 'input_object', []);
      this.sendActionFromEvent('onChange', 'output_object', newValue);
    } else {
      var formattedValue = formatValue(newValue);
      this.createDataFromEvent('onChange', 'formatted_output', formattedValue);
      this.createDataFromEvent('onChange', 'output_object', newValue);
      this.sendActionFromEvent('onChange', 'formatted_output', formattedValue);
    }
  };

  Controller.prototype.formTriggered = function (newValue) {
    if (this.module.getConfiguration('replaceObj')) {
      this.setVarFromEvent('formTriggered', 'output_object', 'input_object', []);
    } else {
      var formattedValue = formatValue(newValue);
      this.createDataFromEvent('formTriggered', 'formatted_output', formattedValue);
      this.createDataFromEvent('formTriggered', 'output_object', newValue);
    }

    this.sendActionFromEvent('formTriggered', 'formatted_output', formattedValue);
    this.sendActionFromEvent('formTriggered', 'output_object', newValue);
  };

  function formatValue(value) {
    var result = {};
    var objToFormat = value.sections.main[0].groups.main[0];
    for (var i in objToFormat) {
      result[i] = formatFieldValue(objToFormat[i]);
    }
    return result;
  }

  function formatFieldValue(value) {
    if (value.length === 1) {
      return value[0];
    } else {
      return value;
    }
  }

  return Controller;
});
