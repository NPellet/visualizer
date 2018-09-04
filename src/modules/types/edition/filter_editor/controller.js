'use strict';

define(['modules/types/client_interaction/code_editor/controller', 'src/util/util', 'src/util/debug'], function (CodeEditor, Util, Debug) {
  function Controller() {
    CodeEditor.call(this);
  }

  Util.inherits(Controller, CodeEditor);

  Controller.prototype.moduleInformation = {
    name: 'Filter editor',
    description: 'Write code for a filter and test it in real time',
    author: 'Michaël Zasso',
    date: '04.02.2014',
    license: 'MIT'
  };

  Controller.prototype.references = $.extend({}, Controller.prototype.references, {
    dataobject: { label: 'Object to filter' },
    filteredObject: { label: 'Filtered object' }
  });

  Controller.prototype.events = {
    onButtonClick: {
      label: 'Button was clicked / Incoming variable',
      refVariable: ['filteredObject']
    }
  };

  Controller.prototype.variablesIn = ['dataobject'];

  Controller.prototype.actionsIn = $.extend({}, Controller.prototype.actionsIn, { doFilter: 'Trigger the filter' });

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            script: {
              type: 'jscode',
              title: 'Code',
              default: '//When the result is ready, use resolve(result) to send it.\n//In case of an error, use reject(error)\nresolve(value);'
            }
          }
        },
        libs: {
          options: {
            type: 'table',
            multiple: 'true'
          },
          fields: {
            lib: {
              type: 'text',
              title: 'url'
            },
            alias: {
              type: 'text',
              title: 'alias'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    script: ['groups', 'group', 0, 'script', 0],
    libs: ['groups', 'libs', 0]
  };

  Controller.prototype.onButtonClick = function (value, object) {
    var that = this;
    var result = this.executeFilter(value, object);
    result.then(function (data) {
      if (typeof data !== 'undefined')
        that.createDataFromEvent('onButtonClick', 'filteredObject', data);
    }, function (error) {
      Debug.error(`Filter execution error (filter title: ${that.module.definition.title}) : `, error);
    });
  };

  Controller.prototype.executeFilter = function (filter, object) {
    var neededLibs = this.module.getConfiguration('libs');
    var requireStart = `require${getRequireStart(neededLibs)}`;

    var requireBody = `(function(value, resolve, reject){${filter}\n})(object, resolve, reject);`;

    var requireEnd = '});';


    return new Promise(function (resolve, reject) {
      eval(`"use strict";${requireStart}${requireBody}${requireEnd}`);
    });
  };

  Controller.prototype.export = function () {
    var neededLibs = this.module.getConfiguration('libs');
    var requireStart = `define${getRequireStart(neededLibs)}\n    return {\n    filter: `;
    var requireBody = `function( value, resolve, reject ) {\n            ${this.module.getConfiguration('script').replace(/(\r\n|\r|\n)/g, '\n            ')}\n        }\n    };`;
    var requireEnd = '\n});';

    return requireStart + requireBody + requireEnd;
  };

  function getRequireStart(neededLibs) {
    var required = '( [ "src/util/api"';
    var callback = 'function( API';

    if (neededLibs) {
      for (var i = 0; i < neededLibs.length; i++) {
        var neededLib = neededLibs[i];
        if (neededLib.lib) {
          required += `, "${neededLib.lib}"`;
          callback += `, ${neededLib.alias || `required_anonymous_${i}`}`;
        }
      }
    }

    return `${required} ], ${callback} ){`;
  }

  return Controller;
});
