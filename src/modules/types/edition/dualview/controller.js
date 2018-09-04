'use strict';

define(['modules/default/defaultcontroller', 'modules/types/edition/onde/controller', 'modules/types/display/template-twig/controller'], function (Default, OndeC, TwigC) {
  function Controller() {
    this.twigC = new TwigC();
    this.ondeC = new OndeC();
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.setModule = function (module) {
    this.module = module;
    this.twigC.module = module.twigM;
    this.twigC.module.controller = this.twigC;
    this.ondeC.module = module.ondeM;
    this.ondeC.module.controller = this.ondeC;
  };

  Controller.prototype.init = function () {
    this.twigC.init();
    this.ondeC.init();
  };

  Controller.prototype.moduleInformation = {
    name: 'Edit/Display',
    description: 'Dual-view module, with a displayer that is based on Twig and a JSON editor based on Onde.',
    author: 'Michaël Zasso',
    date: '13.05.2014',
    license: 'MIT',
    cssClass: 'dualview',
    hidden: true
  };

  Controller.prototype.references = {
    value: {
      label: 'Any object'
    }
  };

  Controller.prototype.variablesIn = ['value'];

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            template: {
              type: 'jscode',
              title: 'Template',
              mode: 'html',
              default: ''
            },
            schema: {
              type: 'jscode',
              title: 'Schema',
              mode: 'json',
              default: '{}'
            },
            button_text: {
              type: 'text',
              title: 'Text of the save button',
              default: 'Save'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configFunctions = {
    mode: function () {
      return 'schema';
    },
    schemaSource: function () {
      return 'config';
    },
    output: function () {
      return 'modified';
    }
  };

  Controller.prototype.configAliases = {
    template: ['groups', 'group', 0, 'template', 0],
    schema: ['groups', 'group', 0, 'schema', 0],
    button_text: ['groups', 'group', 0, 'button_text', 0],
    mode: [],
    schemaSource: [],
    output: []
  };

  return Controller;
});
