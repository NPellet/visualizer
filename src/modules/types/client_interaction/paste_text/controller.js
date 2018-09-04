'use strict';

define(['modules/default/defaultcontroller'], function (Default) {
  function Controller() {
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Paste value',
    description: 'Paste any text and parse it in a variable',
    author: 'Michaël Zasso',
    date: '05.03.2014',
    license: 'MIT',
    cssClass: 'paste_text'
  };

  Controller.prototype.references = {
    value: {
      label: 'The parsed object'
    }
  };

  Controller.prototype.events = {
    onEditorChange: {
      label: 'The value in the editor has changed',
      refVariable: ['value']
    }
  };

  Controller.prototype.configurationStructure = function () {
    return {
      groups: {
        group: {
          options: {
            type: 'list'
          },
          fields: {
            thevalue: {
              type: 'jscode',
              title: 'Value',
              mode: 'text',
              default: ''
            },
            type: {
              type: 'combo',
              title: 'Data type',
              options: [
                { title: 'Text', key: 'text' },
                { title: 'JSON', key: 'json' },
                { title: 'XML', key: 'xml' },
                { title: 'CSV', key: 'csv' }
              ],
              default: 'text'
            }
          }
        }
      }
    };
  };

  Controller.prototype.configAliases = {
    type: ['groups', 'group', 0, 'type', 0],
    thevalue: ['groups', 'group', 0, 'thevalue', 0]
  };

  Controller.prototype.valueChanged = function (value) {
    var type = this.module.getConfiguration('type'),
      def = $.Deferred(),
      that = this;
    switch (type) {
      case 'text':
        def.resolve(value);
        break;
      case 'json':
        def.resolve(JSON.parse(value));
        break;
      case 'csv':
        require(['papaparse'], function (Papa) {
          def.resolve(Papa.parse(value).data);
        });
        break;
      case 'xml':
        require(['x2js'], function (X2JS) {
          def.resolve(new X2JS().xml_str2json(value));
        });
        break;
    }
    def.done(function (data) {
      if (that.module.definition.configuration.groups) that.module.definition.configuration.groups.group[0].thevalue[0] = value;
      that.createDataFromEvent('onEditorChange', 'value', DataObject.check(data, true));
    });
  };

  return Controller;
});
