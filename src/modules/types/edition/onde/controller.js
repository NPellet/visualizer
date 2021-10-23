'use strict';

define([
  'modules/default/defaultcontroller',
  'lib/json-schema/schema',
  'lodash',
  'src/util/debug',
  'js-yaml'
], function (Default, Schema, _, Debug, Yaml) {
  function Controller() {}

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Onde form',
    description: 'Create a form base on a schema and output an object',
    author: 'Michaël Zasso',
    date: '17.04.2014',
    license: 'MIT',
    cssClass: 'onde'
  };

  Controller.prototype.initImpl = function () {
    this.inputSchema = {};
    this.resolveReady();
  };

  Controller.prototype.references = {
    inputValue: {
      label: 'Input object'
    },
    outputValue: {
      label: 'Output object'
    },
    schema: {
      label: 'JSON schema'
    }
  };

  Controller.prototype.events = {
    onFormSubmit: {
      label: 'The form was submitted',
      refVariable: ['outputValue'],
      refAction: ['outputValue']
    }
  };

  Controller.prototype.variablesIn = ['inputValue', 'schema'];

  Controller.prototype.actionsIn = {};

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            hasButton: {
              type: 'checkbox',
              title: 'Export options',
              default: ['show'],
              options: {
                show: 'Show button',
                onload: 'Export data on load'
              }
            },
            button_text: {
              type: 'text',
              title: 'Text of the export button',
              default: 'Export'
            },
            debouncing: {
              type: 'float',
              title: 'Debouncing',
              default: -1
            },
            output: {
              type: 'combo',
              title: 'Output result',
              options: [
                {
                  title: 'Modified input object',
                  key: 'modified'
                },
                { title: 'New object', key: 'new' }
              ],
              default: 'new'
            },
            mode: {
              type: 'combo',
              title: 'Form generation',
              options: [
                { title: 'Input object', key: 'object' },
                { title: 'Schema', key: 'schema' },
                { title: 'Both', key: 'both' }
              ],
              default: 'object',
              displaySource: {
                object: 'o',
                schema: 's',
                both: 'b'
              }
            },
            schemaSource: {
              type: 'combo',
              title: 'Schema source',
              options: [
                { title: 'Input variable', key: 'variable' },
                { title: 'Config', key: 'config' }
              ],
              displayTarget: ['s', 'b'],
              displaySource: {
                config: 'c'
              },
              default: 'config'
            },
            schema: {
              type: 'jscode',
              mode: 'yaml',
              title: 'YAML schema',
              default: '{}',
              displayTarget: ['c']
            },
            onchangeFilter: {
              type: 'jscode',
              title: 'Execute on change'
            }
          }
        },
        data: {
          options: {
            type: 'list',
            title: 'Data'
          },
          fields: {
            saveInView: {
              type: 'checkbox',
              title: 'Save in view',
              options: {
                yes: 'yes'
              },
              displaySource: { yes: 'saveInView' },
              default: []
            },
            varname: {
              type: 'text',
              title: 'Variable name',
              default: '',
              displayTarget: ['saveInView']
            },
            data: {
              type: 'jscode',
              title: 'Data',
              default: '{}',
              displayTarget: ['saveInView']
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    output: ['groups', 'group', 0, 'output', 0],
    mode: ['groups', 'group', 0, 'mode', 0],
    schemaSource: ['groups', 'group', 0, 'schemaSource', 0],
    schema: ['groups', 'group', 0, 'schema', 0],
    button_text: ['groups', 'group', 0, 'button_text', 0],
    hasButton: ['groups', 'group', 0, 'hasButton', 0],
    debouncing: ['groups', 'group', 0, 'debouncing', 0],
    onchangeFilter: ['groups', 'group', 0, 'onchangeFilter', 0],
    saveInView: ['groups', 'data', 0, 'saveInView', 0],
    data: ['groups', 'data', 0, 'data', 0],
    varname: ['groups', 'data', 0, 'varname', 0]
  };

  Controller.prototype.onBeforeSave = function (formValue) {
    var varname = formValue.module_specific_config[0].groups.data[0].varname[0];
    var saveInView =
      formValue.module_specific_config[0].groups.data[0].saveInView[0].length;
    var vars_in = formValue.vars_in[0].groups.group[0];
    var output = formValue.module_specific_config[0].groups.group[0].output[0];
    if (saveInView && output !== 'modified') {
      Debug.warn(
        'onde: if save in view is activated you probably want to modify var in'
      );
    }
    var varin = vars_in.filter(function (v) {
      return v.rel === 'inputValue';
    })[0];
    if (varname && saveInView) {
      if (varin && varin.name) {
        varin.name = varname;
      } else {
        vars_in.push({
          rel: 'inputValue',
          name: varname
        });
      }
    } else if (!saveInView) {
      formValue.vars_in[0].groups.group[0] = vars_in.filter(function (v) {
        return v.name !== varname;
      });
    }
  };

  Controller.prototype.getSchema = function () {
    var mode = this.module.getConfiguration('mode');
    var schema = {};
    if (
      (mode === 'object' || mode === 'both') &&
      this.module.view.inputVal !== null
    ) {
      schema = Schema.fromObject(this.module.view.inputVal);
    }
    if (mode === 'schema' || mode === 'both') {
      var schemaSource = this.module.getConfiguration('schemaSource');
      var intSchema;
      if (schemaSource === 'variable') intSchema = this.inputSchema;
      else intSchema = Yaml.safeLoad(this.module.getConfiguration('schema'));
      $.extend(true, schema, intSchema);
    }
    if (_.isEmpty(schema)) return;
    schemaJpath(schema, []);
    return schema;
  };

  function schemaJpath(schema, jpath) {
    if (schema.type === 'object' && typeof schema.properties === 'object') {
      for (var key in schema.properties) {
        schema.jpath = jpath;
        var njpath = jpath.slice();
        njpath.push(key);
        schemaJpath(schema.properties[key], njpath);
      }
    } else if (schema.type === 'array' && schema.items) {
      schema.jpath = jpath;
      var njpath = jpath.slice();
      njpath.push('$array$');
      schemaJpath(schema.items, njpath);
    } else {
      schema.jpath = jpath;
    }
  }

  Controller.prototype.onSubmit = function (data) {
    var outputType = this.module.getConfiguration('output');
    if (outputType === 'modified' && this.module.view.inputObj) {
      this.module.view.inputObj.mergeWith(data, this.module.getId());
    }
    this.createDataFromEvent('onFormSubmit', 'outputValue', data);
    this.sendActionFromEvent('onFormSubmit', 'outputValue', data);
  };

  return Controller;
});
